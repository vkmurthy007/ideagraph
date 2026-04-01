
import { motion } from 'framer-motion';
import type { GraphNode as GraphNodeType, StyleVariant, NodePosition } from '../../lib/types';
import { BRANCH_COLORS, ANIMATION } from '../../lib/constants';

interface Props {
  node: GraphNodeType;
  position: NodePosition;
  variant: StyleVariant;
  isHovered: boolean;
  isExpanded: boolean;
  isExpanding: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
  animationDelay?: number;
}

const BRANCH_LABELS: Record<string, string> = {
  user: 'USER', useCases: 'USE CASE', systemType: 'SYSTEM',
  value: 'VALUE', risks: 'RISK', dependencies: 'DEP',
};

export function GraphNode({ node, position, variant, isHovered, isExpanded, isExpanding, onHoverStart, onHoverEnd, onClick, animationDelay = 0 }: Props) {
  const bc = BRANCH_COLORS[node.branch];
  const isRoot      = node.type === 'root';
  const isPrimary   = node.type === 'primary';
  const isSecondary = node.type === 'secondary';

  const w = isRoot ? 156 : isPrimary ? 96 : 118;
  const h = isRoot ? 50  : isPrimary ? 30 : 42;

  // Card fill and border based on variant
  const fills: Record<StyleVariant, { bg: string; border: string; opacity: number }> = {
    default:    { bg: '#1e1e30', border: 'rgba(255,255,255,0.18)', opacity: 1.0  },
    unresolved: { bg: '#141420', border: 'rgba(255,255,255,0.08)', opacity: 0.6  },
    stable:     { bg: '#0f2b1a', border: '#22c55e',                opacity: 1.0  },
    uncertain:  { bg: '#261d00', border: '#ca8a04',                opacity: 0.9  },
    fragile:    { bg: '#2b0f0f', border: '#dc2626',                opacity: 0.55 },
  };

  const f = fills[variant];

  return (
    <motion.g
      transform={`translate(${position.x - w/2}, ${position.y - h/2})`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: f.opacity }}
      exit={{ scale: 0.3, opacity: 0 }}
      transition={{ type: 'spring', stiffness: ANIMATION.nodeEnter.stiffness, damping: ANIMATION.nodeEnter.damping, delay: animationDelay }}
      style={{ cursor: isSecondary ? 'pointer' : 'default' }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={isSecondary ? onClick : undefined}
    >
      {/* Hover outer glow */}
      {isHovered && isSecondary && (
        <motion.rect x={-4} y={-4} width={w+8} height={h+8} rx={7}
          fill="none" stroke={bc} strokeWidth={1.5} opacity={0.4}
          initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} />
      )}

      {/* Card shadow */}
      <rect x={2} y={3} width={w} height={h} rx={5} fill="rgba(0,0,0,0.5)" />

      {/* Card body */}
      <rect x={0} y={0} width={w} height={h} rx={5}
        fill={f.bg} stroke={isHovered && isSecondary ? bc : f.border} strokeWidth={1.2} />

      {/* Root: gold top bar */}
      {isRoot && <rect x={0} y={0} width={w} height={4} rx={5} fill="#c8a96e" />}
      {isRoot && <rect x={0} y={2} width={w} height={2} fill="#c8a96e" />}

      {/* Primary: left color bar */}
      {isPrimary && <rect x={0} y={0} width={4} height={h} rx={5} fill={bc} />}
      {isPrimary && <rect x={0} y={0} width={2} height={h} fill={bc} />}

      {/* Secondary: branch tag */}
      {isSecondary && (
        <text x={w-6} y={9} textAnchor="end"
          fontSize={6} fontWeight={700}
          fontFamily="'SF Mono', 'Fira Code', monospace"
          fill={bc} opacity={0.85} letterSpacing={0.8}>
          {BRANCH_LABELS[node.branch]}
        </text>
      )}

      {/* Speculative dashes */}
      {node.isSpeculative && (
        <rect x={1} y={1} width={w-2} height={h-2} rx={4}
          fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="4 3" />
      )}

      {/* Expanding border animation */}
      {isExpanding && (
        <motion.rect x={0} y={0} width={w} height={h} rx={5}
          fill="none" stroke={bc} strokeWidth={2}
          strokeDasharray="30 200"
          animate={{ strokeDashoffset: [0, -230] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      )}

      {/* ROOT: title */}
      {isRoot && (
        <>
          <text x={w/2} y={23} textAnchor="middle"
            fontSize={12} fontWeight={700} fontFamily="Inter, sans-serif"
            fill="#f5e6c8" letterSpacing={0.2}>
            {truncate(node.title, 20)}
          </text>
          <text x={w/2} y={37} textAnchor="middle"
            fontSize={7} fontWeight={500} fontFamily="monospace"
            fill="rgba(200,169,110,0.45)" letterSpacing={1.5}>
            IDEA · STRUCTURE
          </text>
        </>
      )}

      {/* PRIMARY: title */}
      {isPrimary && (
        <text x={w/2 + 3} y={h/2 + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={9.5} fontWeight={600} fontFamily="Inter, sans-serif"
          fill="#e8e8f8" letterSpacing={0.2}>
          {node.title}
        </text>
      )}

      {/* SECONDARY: title */}
      {isSecondary && (
        <text x={9} y={isHovered ? h/2 - 2 : h/2 + 1}
          dominantBaseline="middle"
          fontSize={9} fontWeight={500} fontFamily="Inter, sans-serif"
          fill="#d8d8ec" letterSpacing={0.1}>
          {truncate(node.title, 15)}
        </text>
      )}

      {/* SECONDARY: insight on hover */}
      {isSecondary && isHovered && node.insight && (
        <motion.text x={9} y={h/2 + 10} dominantBaseline="middle"
          fontSize={7} fontWeight={300} fontFamily="Inter, sans-serif"
          fill={bc} opacity={0.85}
          initial={{ opacity: 0 }} animate={{ opacity: 0.85 }}>
          {truncate(node.insight, 18)}
        </motion.text>
      )}

      {/* Expanded marker */}
      {isExpanded && (
        <text x={w-7} y={h-5} textAnchor="middle" fontSize={8} fill={bc} fontFamily="monospace">✓</text>
      )}
    </motion.g>
  );
}

function truncate(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}
