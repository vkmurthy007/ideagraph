// api/collapse.ts
// POST /api/collapse
// Generates the seed insight sentence after speculative nodes are removed.
// Non-streaming (short response) — emits via SSE for consistency with other routes.

import type { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS } from '../src/lib/prompts';
import { CollapseResponseSchema } from './schemas';
import { initSSE, emit, emitDone, emitError } from './sse';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function handleCollapse(req: Request, res: Response) {
  const { idea, remainingNodes } = req.body as {
    idea?: string;
    remainingNodes?: string[];
  };

  if (!idea || !remainingNodes || remainingNodes.length === 0) {
    res.status(400).json({ error: 'idea and remainingNodes are required' });
    return;
  }

  initSSE(res);

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: PROMPTS.COLLAPSE_USER(idea, remainingNodes),
        },
      ],
      system: PROMPTS.COLLAPSE_SYSTEM,
    });

    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('')
      .trim();

    const validated = CollapseResponseSchema.safeParse(raw);
    if (!validated.success) {
      // Fallback gracefully — don't block the collapse interaction
      emit(res, 'seed', { insight: `This is a narrower product than it first appears.` });
      emitDone(res);
      return;
    }

    emit(res, 'seed', { insight: validated.data });
    emitDone(res);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[collapse] Error:', message);
    emit(res, 'seed', { insight: `This is what survives when the assumptions are removed.` });
    emitDone(res);
  }
}
