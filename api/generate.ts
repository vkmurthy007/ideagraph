// api/generate.ts
// POST /api/generate
// Pass 1: Calls Claude to expand a product idea into a graph skeleton.
// Streams nodes + edges via SSE as soon as the full JSON is parsed.

import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS } from '../src/lib/prompts';
import { Pass1ResponseSchema } from './schemas';
import { initSSE, emit, emitDone, emitError, parseJSON } from './sse';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function handleGenerate(req: Request, res: Response) {
  const { idea } = req.body as { idea?: string };

  if (!idea || typeof idea !== 'string' || idea.trim().length < 3) {
    res.status(400).json({ error: 'idea is required (min 3 chars)' });
    return;
  }

  const trimmedIdea = idea.trim().slice(0, 500); // Hard cap

  initSSE(res);

  try {
    // Call Claude — non-streaming for Pass 1 since we need the full JSON
    // before we can validate and emit nodes. The perceivable latency is masked
    // by the IdeaInput → GraphCanvas transition animation (~0.5s).
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: PROMPTS.PASS_1_USER(trimmedIdea),
        },
      ],
      system: PROMPTS.PASS_1_SYSTEM,
    });

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    let parsed: unknown;
    try {
      parsed = parseJSON(raw);
    } catch {
      emitError(res, 'Failed to parse graph JSON from model response');
      return;
    }

    const validated = Pass1ResponseSchema.safeParse(parsed);
    if (!validated.success) {
      console.error('[generate] Schema validation failed:', validated.error.issues);
      emitError(res, 'Graph structure validation failed');
      return;
    }

    const data = validated.data;

    // Build primary nodes from branch keys
    const BRANCH_META: Record<string, { id: string; title: string }> = {
      user:         { id: 'p-user',       title: 'User' },
      useCases:     { id: 'p-usecases',   title: 'Use Cases' },
      systemType:   { id: 'p-systemtype', title: 'System Type' },
      value:        { id: 'p-value',      title: 'Value' },
      risks:        { id: 'p-risks',      title: 'Risks' },
      dependencies: { id: 'p-deps',       title: 'Dependencies' },
    };

    // Emit root node
    emit(res, 'node', data.root);

    // Emit primary nodes + their edges + secondary nodes per branch
    // Stagger emission to create the progressive "growing" feel
    for (const [branch, meta] of Object.entries(BRANCH_META)) {
      const secondaries = data.branches[branch as keyof typeof data.branches];
      if (!secondaries || secondaries.length === 0) continue;

      // Primary node
      const primaryNode = {
        id: meta.id,
        type: 'primary' as const,
        branch: branch as any,
        title: meta.title,
        insight: '',
        breakPoint: '',
        isSpeculative: false,
        stability: { trust: 0.5, scale: 0.5, latency: 0.5, retention: 0.5, cost: 0.5, regulation: 0.5 },
      };
      emit(res, 'node', primaryNode);

      // Root → Primary edge
      emit(res, 'edge', { source: 'root', target: meta.id, type: 'hierarchical' });

      // Secondary nodes + edges
      for (const node of secondaries) {
        emit(res, 'node', node);
        emit(res, 'edge', { source: meta.id, target: node.id, type: 'hierarchical' });
      }

      // Small delay between branches for progressive rendering feel
      await sleep(80);
    }

    emitDone(res);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[generate] Error:', message);
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      emitError(res, message);
    }
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
