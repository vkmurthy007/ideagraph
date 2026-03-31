// api/sse.ts
// Helpers for writing Server-Sent Events from Express route handlers.

import type { Response } from 'express';

export function initSSE(res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable Nginx buffering
  res.flushHeaders();
}

type EventType =
  | 'node'
  | 'edge'
  | 'stability'
  | 'breakpoint'
  | 'crossedge'
  | 'seed'
  | 'done'
  | 'error';

export function emit(res: Response, type: EventType, payload: unknown) {
  res.write(`data: ${JSON.stringify({ type, payload })}\n\n`);
  // Force flush on platforms that buffer (Railway, etc.)
  if (typeof (res as any).flush === 'function') (res as any).flush();
}

export function emitDone(res: Response) {
  emit(res, 'done', null);
  res.end();
}

export function emitError(res: Response, message: string) {
  emit(res, 'error', { message });
  res.end();
}

/**
 * Strip markdown fences and parse JSON safely.
 * LLMs sometimes wrap JSON in ```json ... ``` blocks.
 */
export function parseJSON(raw: string): unknown {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
}
