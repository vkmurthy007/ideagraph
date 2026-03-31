// src/hooks/useNodeExpand.ts
// Phase 6: On-demand expansion when a secondary node is clicked.
// Calls /api/expand, streams 2–3 deeper nodes into the graph.

import { useCallback } from 'react';
import { useGraphStore } from '../store/graphStore';
import type { GraphNode, GraphEdge, SSEEvent } from '../lib/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function useNodeExpand() {
  const {
    idea,
    expandedNodeIds,
    expandingNodeId,
    addNode,
    addEdge,
    setExpandingNode,
    markExpanded,
    generationPhase,
  } = useGraphStore((s) => ({
    idea:             s.idea,
    expandedNodeIds:  s.expandedNodeIds,
    expandingNodeId:  s.expandingNodeId,
    addNode:          s.addNode,
    addEdge:          s.addEdge,
    setExpandingNode: s.setExpandingNode,
    markExpanded:     s.markExpanded,
    generationPhase:  s.generationPhase,
  }));

  const expandNode = useCallback(async (node: GraphNode) => {
    // Only secondary nodes expand; only when generation is complete; only once
    if (node.type !== 'secondary') return;
    if (generationPhase !== 'ready') return;
    if (expandedNodeIds.has(node.id)) return;
    if (expandingNodeId) return; // One expansion at a time

    setExpandingNode(node.id);

    try {
      const res = await fetch(`${API_URL}/api/expand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea,
          nodeId:      node.id,
          nodeTitle:   node.title,
          nodeInsight: node.insight,
        }),
      });

      if (!res.ok) throw new Error(`Expand failed: ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6)) as SSEEvent;
            if (event.type === 'done') break;
            if (event.type === 'node') addNode(event.payload as GraphNode);
            if (event.type === 'edge') addEdge(event.payload as GraphEdge);
          } catch { /* partial chunk */ }
        }
      }

      markExpanded(node.id);
    } catch (err) {
      console.warn('[expand] Failed for node', node.id, err);
    } finally {
      setExpandingNode(null);
    }
  }, [idea, expandedNodeIds, expandingNodeId, generationPhase, addNode, addEdge, setExpandingNode, markExpanded]);

  return { expandNode, expandedNodeIds, expandingNodeId };
}
