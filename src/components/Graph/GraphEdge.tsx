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

export function GraphEdgeComponent({ edge, sourcePos, targetPos, sourceNode, targetNode, sourceVariant, targetVariant, isHighlighted }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const isCausal = edge.type === 'causal';
  const fragile  = sourceVariant === 'fragile' || targetVariant === 'fragile';
  const stable   = sourceVariant === 'stable'  && targetVariant === 'stable';
  const unres    = sourceVariant === 'unresolved';

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray  = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    el.style.transition = `stroke-dashoffset ${isCausal ? 900 : 500}ms ease-out ${isCausal ? 700 : 0}ms`;
    requestAnimationFrame(() => { if (el) el.style.strokeDashoffset = '0'; });
  }, [isCausal]);

  const mx = (sourcePos.x + targetPos.x) / 2;
  const my = (sourcePos.y + targetPos.y) / 2;

  let d: string;
  if (isCausal) {
    const dx = targetPos.y - sourcePos.y;
    const dy = sourcePos.x - targetPos.x;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    d = `M ${sourcePos.x} ${sourcePos.y} Q ${mx + (dx/len)*50} ${my + (dy/len)*50} ${targetPos.x} ${targetPos.y}`;
  } else {
    d = `M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`;
  }

  const bc = BRANCH_COLORS[sourceNode.branch];
  let stroke: string, sw: number, opacity: number;

  if (unres) {
    stroke = 'rgba(255,255,255,0.06)'; sw = 0.5; opacity = 1;
  } else if (isCausal) {
    stroke = isHighlighted ? bc : `${bc}66`;
    sw = isHighlighted ? 1.8 : 1;
    opacity = fragile ? 0.3 : 0.85;
  } else if (stable) {
    stroke = '#22c55e'; sw = 1; opacity = 0.7;
  } else if (fragile) {
    stroke = '#ef4444'; sw = 0.5; opacity = 0.35;
  } else {
    stroke = 'rgba(150,150,200,0.2)'; sw = 0.8; opacity = 1;
  }

  return (
    <g opacity={opacity} style={{ transition: 'opacity 0.3s ease' }}>
      <path ref={pathRef} d={d} stroke={stroke} strokeWidth={sw}
        strokeDasharray={fragile && isCausal ? '3 5' : undefined}
        fill="none" strokeLinecap="round"
        style={{ transition: 'stroke 0.3s ease, stroke-width 0.3s ease' }} />
      {isCausal && isHighlighted && edge.label && (
        <text x={mx} y={my - 6} textAnchor="middle" fontSize={9} fontWeight={400}
          fontFamily="Inter, sans-serif" fill={bc} opacity={0.9}
          style={{ pointerEvents: 'none', userSelect: 'none' }}>
          {edge.label}
        </text>
      )}
    </g>
  );
}
