import { motion } from 'framer-motion';
import type { GraphNode as GraphNodeType, StyleVariant, NodePosition } from '../../lib/types';
import { NODE_SIZE, BRANCH_COLORS, ANIMATION } from '../../lib/constants';

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

const VARIANT_STYLES: Record<StyleVariant, { fill: string; stroke: string; opacity: number }> = {
  default:    { fill: '#1c1c28', stroke: '#4a4a6a',  opacity: 1.0  },
  unresolved: { fill: '#141420', stroke: '#2a2a3a',  opacity: 0.6  },
  stable:     { fill: '#0d2b1a', stroke: '#22c55e',  opacity: 1.0  },
  uncertain:  { fill: '#2b2200', stroke: '#eab308',  opacity: 0.85 },
  fragile:    { fill: '#2b0d0d', stroke: '#ef4444',  opacity: 0.5  },
};

export function GraphNode({ node, position, variant, isHovered, isExpanded, isExpanding, onHoverStart, onHoverEnd, onClick, animationDelay = 0 }: Props) {
  const r  = NODE_SIZE[node.type];
  const vs = VARIANT_STYLES[variant];
  const bc = BRANCH_COLORS[node.branch];
  const isRoot      = node.type === 'root';
  const isPrimary   = node.type === 'primary';
  const isSecondary = node.type === 'secondary';

  return (
    <motion.g
      transform={`translate(${position.x}, ${position.y})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: vs.opacity }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: ANIMATION.nodeEnter.stiffness, damping: ANIMATION.nodeEnter.damping, delay: animationDelay }}
      style={{ cursor: isSecondary ? 'pointer' : 'default' }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={isSecondary ? onClick : undefined}
    >
      {/* Root: glowing outer rings */}
      {isRoot && <>
        <motion.circle r={r + 18} fill="none" stroke="#c8a96e" strokeWidth={1} opacity={0.15}
          animate={{ r: [r+18, r+24, r+18] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} />
        <circle r={r + 10} fill="none" stroke="#c8a96e" strokeWidth={1.5} opacity={0.3} />
        <circle r={r + 4}  fill="none" stroke="#c8a96e" strokeWidth={1}   opacity={0.5} />
      </>}

      {/* Primary: branch color ring */}
      {isPrimary && <circle r={r + 4} fill="none" stroke={bc} strokeWidth={1.5} opacity={0.4} />}

      {/* Hover glow */}
      {isHovered && isSecondary && (
        <motion.circle r={r + 14} fill={bc} opacity={0.1}
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 0.12 }} />
      )}

      {/* Expanded ring */}
      {isExpanded && <circle r={r + 7} fill="none" stroke={bc} strokeWidth={1} strokeDasharray="4 3" opacity={0.7} />}

      {/* Node body */}
      <circle r={r} fill={vs.fill} stroke={isRoot ? '#c8a96e' : bc} strokeWidth={isRoot ? 2.5 : isPrimary ? 2 : 1.5} />

      {/* Inner fill highlight */}
      <circle r={r * 0.6} fill={isRoot ? 'rgba(200,169,110,0.08)' : `${bc}15`} />

      {/* Speculative dashed overlay */}
      {node.isSpeculative && <circle r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="3 3" />}

      {/* Expanding spinner */}
      {isExpanding && (
        <motion.circle r={r + 4} fill="none" stroke={bc} strokeWidth={2}
          strokeDasharray={`${(r+4)*2*Math.PI*0.25} ${(r+4)*2*Math.PI*0.75}`}
          strokeLinecap="round" opacity={0.9}
          animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '0 0' }} />
      )}

      {/* Title */}
      <text
        textAnchor="middle"
        dy={isSecondary ? '0.38em' : '0.1em'}
        fontSize={isRoot ? 12 : isPrimary ? 10 : 9}
        fontWeight={isRoot ? 700 : isPrimary ? 600 : 500}
        fontFamily="Inter, system-ui, sans-serif"
        fill={isRoot ? '#f5e6c8' : isPrimary ? '#e8e8f0' : '#d0d0e0'}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        letterSpacing={isRoot ? 0.5 : 0}
      >
        {truncate(node.title, isRoot ? 22 : isPrimary ? 14 : 14)}
      </text>

      {/* Insight on hover */}
      {isSecondary && isHovered && node.insight && (
        <motion.foreignObject x={-80} y={r + 6} width={160} height={40}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          <div style={{
            background: 'rgba(10,10,20,0.92)',
            border: `1px solid ${bc}55`,
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 9,
            fontWeight: 300,
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(210,210,230,0.9)',
            lineHeight: 1.4,
            textAlign: 'center',
          }}>
            {truncate(node.insight, 50)}
          </div>
        </motion.foreignObject>
      )}

      {/* "+" expand hint */}
      {isSecondary && isHovered && !isExpanded && !isExpanding && (
        <motion.circle r={6} cx={r + 2} cy={-r - 2} fill={bc} opacity={0.9}
          initial={{ scale: 0 }} animate={{ scale: 1 }} />
      )}
      {isSecondary && isHovered && !isExpanded && !isExpanding && (
        <motion.text x={r + 2} y={-r - 2} textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fontWeight={700} fill="#0a0a0f"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ pointerEvents: 'none', userSelect: 'none' }}>+</motion.text>
      )}
    </motion.g>
  );
}

function truncate(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}
