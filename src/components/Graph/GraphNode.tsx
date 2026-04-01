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

const VARIANT_OVERLAY: Record<StyleVariant, { border: string; bg: string; opacity: number }> = {
  default:    { border: 'rgba(255,255,255,0.12)', bg: 'rgba(16,16,28,0.92)',   opacity: 1.0 },
  unresolved: { border: 'rgba(255,255,255,0.05)', bg: 'rgba(10,10,18,0.7)',    opacity: 0.55 },
  stable:     { border: '#22c55e',                bg: 'rgba(5,25,12,0.95)',    opacity: 1.0 },
  uncertain:  { border: '#eab308',                bg: 'rgba(20,16,0,0.95)',    opacity: 0.88 },
  fragile:    { border: '#ef4444',                bg: 'rgba(25,5,5,0.95)',     opacity: 0.5 },
};

const BRANCH_LABELS: Record<string, string> = {
  user: 'USER', useCases: 'USE CASE', systemType: 'SYSTEM', value: 'VALUE', risks: 'RISK', dependencies: 'DEP',
};

export function GraphNode({ node, position, variant, isHovered, isExpanded, isExpanding, onHoverStart, onHoverEnd, onClick, animationDelay = 0 }: Props) {
  const ov = VARIANT_OVERLAY[variant];
  const bc = BRANCH_COLORS[node.branch];
  const isRoot      = node.type === 'root';
  const isPrimary   = node.type === 'primary';
  const isSecondary = node.type === 'secondary';

  // Card dimensions
  const w = isRoot ? 160 : isPrimary ? 100 : 120;
  const h = isRoot ? 52  : isPrimary ? 32  : 44;

  return (
    <motion.g
      transform={`translate(${position.x - w/2}, ${position.y - h/2})`}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: ov.opacity }}
      exit={{ scale: 0.4, opacity: 0 }}
      transition={{ type: 'spring', stiffness: ANIMATION.nodeEnter.stiffness, damping: ANIMATION.nodeEnter.damping, delay: animationDelay }}
      style={{ cursor: isSecondary ? 'pointer' : 'default' }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={isSecondary ? onClick : undefined}
    >
      {/* Hover / selected outer glow */}
      {isHovered && isSecondary && (
        <motion.rect x={-3} y={-3} width={w+6} height={h+6} rx={6}
          fill="none" stroke={bc} strokeWidth={1}
          initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
          style={{ filter: `drop-shadow(0 0 6px ${bc})` }} />
      )}

      {/* Card background */}
      <rect x={0} y={0} width={w} height={h} rx={4}
        fill={ov.bg}
        stroke={isRoot ? '#c8a96e' : isHovered && isSecondary ? bc : ov.border}
        strokeWidth={isRoot ? 1.5 : isHovered ? 1.5 : 1} />

      {/* Root: top accent bar */}
      {isRoot && <rect x={0} y={0} width={w} height={3} rx={4} fill="#c8a96e" opacity={0.8} />}

      {/* Primary: left colored bar */}
      {isPrimary && <rect x={0} y={0} width={3} height={h} rx={2} fill={bc} opacity={0.9} />}

      {/* Secondary: branch tag top-right */}
      {isSecondary && (
        <text x={w - 5} y={10} textAnchor="end"
          fontSize={6} fontWeight={600}
          fontFamily="'SF Mono', 'Fira Code', monospace"
          fill={bc} opacity={0.7} letterSpacing={0.5}>
          {BRANCH_LABELS[node.branch] ?? node.branch.toUpperCase()}
        </text>
      )}

      {/* Speculative indicator */}
      {node.isSpeculative && (
        <rect x={0} y={0} width={w} height={h} rx={4}
          fill="none" stroke="rgba(255,255,255,0.12)"
          strokeWidth={1} strokeDasharray="4 3" />
      )}

      {/* Expanding spinner overlay */}
      {isExpanding && (
        <motion.rect x={0} y={0} width={w} height={h} rx={4}
          fill="none" stroke={bc} strokeWidth={1.5}
          strokeDasharray={`${w} ${(w+h)*2}`}
          animate={{ strokeDashoffset: [0, -(w+h)*2] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
      )}

      {/* Root: IdeaGraph label + idea text */}
      {isRoot && (
        <>
          <text x={w/2} y={22} textAnchor="middle"
            fontSize={11} fontWeight={700}
            fontFamily="Inter, system-ui, sans-serif"
            fill="#f5e6c8" letterSpacing={0.3}>
            {truncate(node.title, 22)}
          </text>
          <text x={w/2} y={36} textAnchor="middle"
            fontSize={7} fontWeight={400}
            fontFamily="'SF Mono', 'Fira Code', monospace"
            fill="rgba(200,169,110,0.5)" letterSpacing={1}>
            IDEA STRUCTURE
          </text>
        </>
      )}

      {/* Primary: branch label */}
      {isPrimary && (
        <text x={w/2 + 4} y={h/2 + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fontWeight={600}
          fontFamily="Inter, system-ui, sans-serif"
          fill="#e0e0f0" letterSpacing={0.3}>
          {node.title}
        </text>
      )}

      {/* Secondary: title */}
      {isSecondary && (
        <text x={9} y={h/2 + (isHovered ? -3 : 1)} dominantBaseline="middle"
          fontSize={9} fontWeight={500}
          fontFamily="Inter, system-ui, sans-serif"
          fill="#d8d8e8" letterSpacing={0.1}>
          {truncate(node.title, 16)}
        </text>
      )}

      {/* Secondary: insight on hover */}
      {isSecondary && isHovered && node.insight && (
        <motion.text x={9} y={h/2 + 9} dominantBaseline="middle"
          fontSize={7} fontWeight={300}
          fontFamily="Inter, system-ui, sans-serif"
          fill={`${bc}cc`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}>
          {truncate(node.insight, 20)}
        </motion.text>
      )}

      {/* Expanded checkmark */}
      {isExpanded && (
        <text x={w - 7} y={h - 6} textAnchor="middle"
          fontSize={7} fill={bc} opacity={0.8}
          fontFamily="monospace">✓</text>
      )}
    </motion.g>
  );
}

function truncate(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}
