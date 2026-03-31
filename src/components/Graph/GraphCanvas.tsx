// src/components/Graph/GraphCanvas.tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useGraphStore, selectVisibleNodes, selectVisibleEdges, selectNodeStyleVariant } from '../../store/graphStore';
import { useForceLayout } from '../../hooks/useForceLayout';
import { useGraphStream } from '../../hooks/useGraphStream';
import { useNodeExpand } from '../../hooks/useNodeExpand';
import { useUrlHash } from '../../hooks/useUrlHash';
import { GraphNode } from './GraphNode';
import { GraphEdgeComponent } from './GraphEdge';
import { BreakTooltip } from '../Overlays/BreakTooltip';
import { SeedInsight } from '../Overlays/SeedInsight';
import { GenerationStatus } from '../Overlays/GenerationStatus';
import { StressBar } from '../Controls/StressBar';
import { CollapseButton } from '../Controls/CollapseButton';
import type { GraphNode as GraphNodeType } from '../../lib/types';

export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 900, height: 700 });

  const nodes           = useGraphStore((s) => s.nodes);
  const edges           = useGraphStore((s) => s.edges);
  const positions       = useGraphStore((s) => s.positions);
  const activeStress    = useGraphStore((s) => s.activeStress);
  const hoveredNodeId   = useGraphStore((s) => s.hoveredNodeId);
  const isCollapsed     = useGraphStore((s) => s.isCollapsed);
  const generationPhase = useGraphStore((s) => s.generationPhase);
  const seedInsight     = useGraphStore((s) => s.seedInsight);
  const setHoveredNode  = useGraphStore((s) => s.setHoveredNode);
  const collapseToReality = useGraphStore((s) => s.collapseToReality);

  const { fetchCollapseInsight } = useGraphStream();
  const { expandNode, expandedNodeIds, expandingNodeId } = useNodeExpand();
  useUrlHash(); // write/read URL hash

  const visibleNodes   = selectVisibleNodes(nodes, isCollapsed);
  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges   = selectVisibleEdges(edges, visibleNodeIds);
  const nodeMap        = new Map<string, GraphNodeType>(nodes.map((n) => [n.id, n]));

  const { reheat } = useForceLayout(visibleNodes, visibleEdges, dims.width, dims.height);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setDims({ width: e.contentRect.width, height: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reheat after collapse
  useEffect(() => { if (isCollapsed) reheat(); }, [isCollapsed, reheat]);

  // Tooltip tracking
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (hoveredNodeId) setTooltipPos({ x: e.clientX, y: e.clientY });
  }, [hoveredNodeId]);

  const hoveredNode = hoveredNodeId ? (nodeMap.get(hoveredNodeId) ?? null) : null;

  const handleCollapse = async () => {
    collapseToReality('Revealing what survives…');
    await fetchCollapseInsight();
  };

  const stressBarDisabled = generationPhase === 'pass1' || generationPhase === 'idle';
  const collapseDisabled  = generationPhase !== 'ready';

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onMouseMove={handleMouseMove}
    >
      <StressBar disabled={stressBarDisabled} />
      {!isCollapsed && <CollapseButton onCollapse={handleCollapse} disabled={collapseDisabled} />}
      <GenerationStatus phase={generationPhase} />

      <svg width={dims.width} height={dims.height} style={{ display: 'block', overflow: 'visible' }}>
        {/* Edges — drawn behind nodes */}
        <g>
          {visibleEdges.map((edge) => {
            const sp = positions[edge.source];
            const tp = positions[edge.target];
            const sn = nodeMap.get(edge.source);
            const tn = nodeMap.get(edge.target);
            if (!sp || !tp || !sn || !tn) return null;

            return (
              <GraphEdgeComponent
                key={`${edge.source}→${edge.target}`}
                edge={edge}
                sourcePos={sp}
                targetPos={tp}
                sourceNode={sn}
                targetNode={tn}
                sourceVariant={selectNodeStyleVariant(sn, activeStress, generationPhase)}
                targetVariant={selectNodeStyleVariant(tn, activeStress, generationPhase)}
                isHighlighted={hoveredNodeId === edge.source || hoveredNodeId === edge.target}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <AnimatePresence>
          {visibleNodes.map((node, i) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const delay = node.type === 'root' ? 0
              : node.type === 'primary' ? 0.08 + i * 0.035
              : 0.25 + i * 0.018;

            return (
              <GraphNode
                key={node.id}
                node={node}
                position={pos}
                variant={selectNodeStyleVariant(node, activeStress, generationPhase)}
                isHovered={hoveredNodeId === node.id}
                isExpanded={expandedNodeIds.has(node.id)}
                isExpanding={expandingNodeId === node.id}
                onHoverStart={() => setHoveredNode(node.id)}
                onHoverEnd={() => setHoveredNode(null)}
                onClick={() => expandNode(node)}
                animationDelay={delay}
              />
            );
          })}
        </AnimatePresence>
      </svg>

      <BreakTooltip node={hoveredNode} position={tooltipPos} />
      {isCollapsed && seedInsight && <SeedInsight insight={seedInsight} />}
    </div>
  );
}
