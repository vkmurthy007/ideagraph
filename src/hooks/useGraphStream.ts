// src/hooks/useGraphStream.ts
import { useCallback, useRef } from 'react';
import { useGraphStore } from '../store/graphStore';
import type { GraphNode, GraphEdge, StabilityMap, SSEEvent } from '../lib/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function useGraphStream() {
  const {
    addNode, addEdge, updateStability, updateBreakPoint,
    setGenerationPhase, setIdea, collapseToReality, reset,
  } = useGraphStore.getState();

  const ideaRef  = useRef<string>('');
  const abortRef = useRef<AbortController | null>(null);

  const dispatchEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'node':     addNode(event.payload as GraphNode); break;
      case 'edge':
      case 'crossedge': addEdge(event.payload as GraphEdge); break;
      case 'stability': {
        const { nodeId, stability } = event.payload as { nodeId: string; stability: StabilityMap };
        updateStability(nodeId, stability);
        break;
      }
      case 'breakpoint': {
        const { nodeId, breakPoint } = event.payload as { nodeId: string; breakPoint: string };
        updateBreakPoint(nodeId, breakPoint);
        break;
      }
      case 'seed': {
        const { insight } = event.payload as { insight: string };
        collapseToReality(insight);
        break;
      }
      case 'error':
        console.error('[stream] Server error:', (event.payload as { message: string }).message);
        break;
    }
  }, [addNode, addEdge, updateStability, updateBreakPoint, collapseToReality]);

  const consumeStream = useCallback(async (response: Response): Promise<void> => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (!data || data === '[DONE]') continue;
        try {
          const event = JSON.parse(data) as SSEEvent;
          if (event.type === 'done') return;
          dispatchEvent(event);
        } catch { /* partial */ }
      }
    }
  }, [dispatchEvent]);

  const generate = useCallback(async (idea: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    ideaRef.current = idea;
    reset();
    setIdea(idea);          // ← store the idea for expand + collapse calls
    setGenerationPhase('pass1');

    try {
      const pass1Res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
        signal: controller.signal,
      });
      if (!pass1Res.ok) throw new Error(`Pass 1 failed: ${pass1Res.status}`);
      await consumeStream(pass1Res);

      setGenerationPhase('pass2');

      const { nodes, edges } = useGraphStore.getState();
      const pass2Res = await fetch(`${API_URL}/api/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, graph: { nodes, edges } }),
        signal: controller.signal,
      });

      if (!pass2Res.ok) {
        console.warn('[stream] Pass 2 failed — stress overlays unavailable');
        setGenerationPhase('ready');
        return;
      }

      await consumeStream(pass2Res);
      setGenerationPhase('ready');

    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      console.error('[stream] Generation error:', err);
      setGenerationPhase('ready');
    }
  }, [reset, setIdea, setGenerationPhase, consumeStream]);

  const fetchCollapseInsight = useCallback(async () => {
    const { nodes } = useGraphStore.getState();
    const remainingNodes = nodes
      .filter((n) => !n.isSpeculative && n.type === 'secondary')
      .map((n) => `${n.title}: ${n.insight}`);

    try {
      const res = await fetch(`${API_URL}/api/collapse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaRef.current, remainingNodes }),
      });
      if (res.ok) await consumeStream(res);
    } catch (err) {
      console.warn('[stream] Collapse insight failed:', err);
    }
  }, [consumeStream]);

  return { generate, fetchCollapseInsight };
}
