// src/hooks/useForceLayout.ts
// D3 owns position computation. React owns the DOM.
// This hook runs the simulation and writes positions to the Zustand store.

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useGraphStore } from '../store/graphStore';
import { FORCE_CONFIG } from '../lib/constants';
import type { GraphNode, GraphEdge } from '../lib/types';

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  type: GraphNode['type'];
}

interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
  edgeType: GraphEdge['type'];
}

export function useForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
) {
  const setPositions = useGraphStore((s) => s.setPositions);
  const simRef = useRef<d3.Simulation<SimNode, SimEdge> | null>(null);

  useEffect(() => {
    if (nodes.length === 0) return;

    const simNodes: SimNode[] = nodes.map((n) => ({
      id: n.id,
      type: n.type,
      // Seed root node at center
      x: n.type === 'root' ? width / 2 : undefined,
      y: n.type === 'root' ? height / 2 : undefined,
      // Fix root node position
      fx: n.type === 'root' ? width / 2 : undefined,
      fy: n.type === 'root' ? height / 2 : undefined,
    }));

    const simEdges: SimEdge[] = edges.map((e) => ({
      source: e.source,
      target: e.target,
      edgeType: e.type,
    }));

    // Stop existing simulation before creating new one
    simRef.current?.stop();

    const sim = d3
      .forceSimulation<SimNode, SimEdge>(simNodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimEdge>(simEdges)
          .id((d) => d.id)
          .distance((d) =>
            d.edgeType === 'causal'
              ? FORCE_CONFIG.linkDistanceCausal
              : FORCE_CONFIG.linkDistanceHierarchical
          )
          .strength((d) => (d.edgeType === 'causal' ? 0.15 : 0.5))
      )
      .force('charge', d3.forceManyBody().strength(FORCE_CONFIG.chargeStrength))
      .force('collision', d3.forceCollide<SimNode>().radius(FORCE_CONFIG.collisionRadius))
      .alphaDecay(FORCE_CONFIG.alphaDecay);

    sim.on('tick', () => {
      const pos: Record<string, { x: number; y: number }> = {};
      for (const n of sim.nodes()) {
        pos[n.id] = { x: n.x ?? 0, y: n.y ?? 0 };
      }
      setPositions(pos);
    });

    simRef.current = sim;

    return () => {
      sim.stop();
    };
    // Re-init when node/edge count changes (topology change)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length, edges.length, width, height]);

  // Reheat when collapse removes nodes
  const reheat = () => simRef.current?.alpha(0.4).restart();

  return { reheat };
}
