// api/expand.ts
// POST /api/expand
// Generates 2–3 deeper nodes when user clicks a secondary node.
// Phase 6 feature — route stubbed now so the server doesn't error.

import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS } from '../src/lib/prompts';
import { GraphNodeSchema } from './schemas';
import { initSSE, emit, emitDone, emitError, parseJSON } from './sse';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function handleExpand(req: Request, res: Response) {
  const { idea, nodeId, nodeTitle, nodeInsight } = req.body as {
    idea?: string;
    nodeId?: string;
    nodeTitle?: string;
    nodeInsight?: string;
  };

  if (!idea || !nodeId || !nodeTitle || !nodeInsight) {
    res.status(400).json({ error: 'idea, nodeId, nodeTitle, nodeInsight are required' });
    return;
  }

  initSSE(res);

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: PROMPTS.EXPAND_USER(nodeTitle, nodeInsight, idea),
        },
      ],
      system: PROMPTS.EXPAND_SYSTEM,
    });

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('');

    let parsed: unknown;
    try {
      parsed = parseJSON(raw);
    } catch {
      emitError(res, 'Failed to parse expansion JSON');
      return;
    }

    const nodes = Array.isArray(parsed) ? parsed : [parsed];

    for (const rawNode of nodes) {
      // Inject required fields that the expand prompt doesn't generate
      const enriched = {
        ...rawNode,
        id: `${nodeId}-x-${Math.random().toString(36).slice(2, 6)}`,
        type: 'secondary',
        branch: rawNode.branch ?? 'risks', // fallback
        breakPoint: rawNode.breakPoint ?? '',
        stability: rawNode.stability ?? {
          trust: 0.5, scale: 0.5, latency: 0.5,
          retention: 0.5, cost: 0.5, regulation: 0.5,
        },
      };

      const validated = GraphNodeSchema.safeParse(enriched);
      if (validated.success) {
        emit(res, 'node', validated.data);
        emit(res, 'edge', { source: nodeId, target: validated.data.id, type: 'hierarchical' });
      }
    }

    emitDone(res);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[expand] Error:', message);
    emitError(res, message);
  }
}
