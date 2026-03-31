// src/components/Graph/GraphEdge.tsx
import { useEffect, useRef } from 'react';
import type { GraphEdge as GraphEdgeType, NodePosition, StyleVariant, GraphNode } from '../../lib/types';
import { BRANCH_COLORS } from '../../lib/constants';

interface Props {
  edge: GraphEdgeType;
  sourcePos: NodePosition;
  targetPos: NodePosition;
  sourceNode: GraphNode;
  targetNode: GraphNode;
  sourceVariant: StyleVariant;
  targetVariant: StyleVariant;
  isHighlighted: boolean;
}

export function GraphEdgeComponent({
  edge, sourcePos, targetPos,
  sourceNode, targetNode,
  sourceVariant, targetVariant, isHighlighted,
}: Props) {
  const pathRef = useRef<SVGPathElement>(null);

  const isCausal  = edge.type === 'causal';
  const fragile   = sourceVariant === 'fragile' || targetVariant === 'fragile';
  const stable    = sourceVariant === 'stable'  && targetVariant === 'stable';
  const unresolved = sourceVariant === 'unresolved' || targetVariant === 'unresolved';

  // Draw-on animation — runs once on mount
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    const length = el.getTotalLength();
    el.style.strokeDasharray  = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    el.style.transition = `stroke-dashoffset ${isCausal ? 800 : 500}ms ease-out`;

    // Delay causal edges slightly so hierarchical edges draw first
    const delay = isCausal ? 600 : 0;
    const tid = setTimeout(() => {
      if (el) el.style.strokeDashoffset = '0';
    }, delay);
    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Path geometry
  const mx = (sourcePos.x + targetPos.x) / 2;
  const my = (sourcePos.y + targetPos.y) / 2;

  let d: string;
  if (isCausal) {
    // Arc causal edges so they don't overlap hierarchical edges
    const dx = targetPos.y - sourcePos.y;
    const dy = sourcePos.x - targetPos.x;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const cx  = mx + (dx / len) * 45;
    const cy  = my + (dy / len) * 45;
    d = `M ${sourcePos.x} ${sourcePos.y} Q ${cx} ${cy} ${targetPos.x} ${targetPos.y}`;
  } else {
    d = `M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`;
  }

  // Color logic
  const bc = BRANCH_COLORS[sourceNode.branch] ?? '#666';
  let stroke: string;
  let strokeWidth: number;
  let opacity: number;

  if (unresolved) {
    stroke = 'rgba(255,255,255,0.04)';
    strokeWidth = 0.5;
    opacity = 0.4;
  } else if (isCausal) {
    stroke = isHighlighted ? `${bc}bb` : `${bc}44`;
    strokeWidth = isHighlighted ? 1.4 : 0.9;
    opacity = fragile ? 0.35 : 0.75;
  } else if (stable) {
    stroke = 'rgba(45,90,61,0.4)';
    strokeWidth = 1;
    opacity = 0.85;
  } else if (fragile) {
    stroke = 'rgba(90,26,26,0.3)';
    strokeWidth = 0.5;
    opacity = 0.4;
  } else {
    stroke = 'rgba(255,255,255,0.09)';
    strokeWidth = 0.8;
    opacity = 0.7;
  }

  // Fragile causal edges flicker via dasharray
  const strokeDasharray = isCausal
    ? (fragile ? '2.5 5' : undefined)
    : undefined;

  // Label midpoint for highlighted causal edges
  const [lx, ly] = isCausal ? [mx, my] : [mx, my];

  return (
    <g opacity={opacity} style={{ transition: 'opacity 0.28s ease' }}>
      <path
        ref={pathRef}
        d={d}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        fill="none"
        strokeLinecap="round"
        style={{ transition: 'stroke 0.28s ease, stroke-width 0.28s ease' }}
      />

      {/* Causal edge label on highlight */}
      {isCausal && isHighlighted && edge.label && (
        <text
          x={lx} y={ly - 5}
          textAnchor="middle"
          fontSize={8.5}
          fontWeight={300}
          fontFamily="Inter, system-ui, sans-serif"
          fill={`${bc}cc`}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}
