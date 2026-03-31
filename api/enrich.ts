// api/enrich.ts
// POST /api/enrich
// Pass 2: Takes the full graph from Pass 1 and enriches it with:
//   - Stability scores per node per stress dimension
//   - Break point statements per node
//   - Cross-edges between nodes in different branches
//
// Streams updates via SSE so nodes visually resolve as data arrives.

import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS } from '../src/lib/prompts';
import { Pass2ResponseSchema } from './schemas';
import { initSSE, emit, emitDone, emitError, parseJSON } from './sse';
import type { GraphData } from '../src/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function handleEnrich(req: Request, res: Response) {
  const { idea, graph } = req.body as { idea?: string; graph?: GraphData };

  if (!idea || !graph) {
    res.status(400).json({ error: 'idea and graph are required' });
    return;
  }

  // Only pass secondary nodes to Pass 2 — primary nodes don't need enrichment
  const secondaryOnly: GraphData = {
    nodes: graph.nodes.filter((n) => n.type === 'secondary'),
    edges: graph.edges,
  };

  if (secondaryOnly.nodes.length === 0) {
    res.status(400).json({ error: 'No secondary nodes to enrich' });
    return;
  }

  initSSE(res);

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: PROMPTS.PASS_2_USER(idea, secondaryOnly),
        },
      ],
      system: PROMPTS.PASS_2_SYSTEM,
    });

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    let parsed: unknown;
    try {
      parsed = parseJSON(raw);
    } catch {
      emitError(res, 'Failed to parse enrichment JSON from model response');
      return;
    }

    const validated = Pass2ResponseSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('[enrich] Schema validation failed:', validated.error.issues);
      // Partial emit — send what we can
      emitError(res, 'Enrichment validation failed — stress overlay unavailable');
      return;
    }

    const data = validated.data;

    // Emit stability + breakpoint updates per node
    for (const [nodeId, stability] of Object.entries(data.stability)) {
      emit(res, 'stability', { nodeId, stability });
    }

    for (const [nodeId, breakPoint] of Object.entries(data.breakPoints)) {
      emit(res, 'breakpoint', { nodeId, breakPoint });
    }

    // Emit cross-edges — filter out any that reference unknown nodes
    const knownIds = new Set(graph.nodes.map((n) => n.id));
    for (const edge of data.crossEdges) {
      if (knownIds.has(edge.source) && knownIds.has(edge.target)) {
        emit(res, 'crossedge', edge);
      }
    }

    emitDone(res);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[enrich] Error:', message);
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      emitError(res, message);
    }
  }
}
