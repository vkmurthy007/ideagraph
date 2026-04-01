
import { motion } from 'framer-motion';
import type { GraphNode as GraphNodeType, StyleVariant, NodePosition } from '../../lib/types';
import { BRANCH_COLORS, NODE_SIZE, ANIMATION } from '../../lib/constants';

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

export function GraphNode({ node, position, variant, isHovered, isExpanded, isExpanding, onHoverStart, onHoverEnd, onClick, animationDelay = 0 }: Props) {
  const bc = BRANCH_COLORS[node.branch];
  const r  = NODE_SIZE[node.type];
  const isRoot      = node.type === 'root';
  const isPrimary   = node.type === 'primary';
  const isSecondary = node.type === 'secondary';

  // Fills: always light enough to be legible
  const bgFill =
    variant === 'stable'     ? '#0f3320' :
    variant === 'uncertain'  ? '#2d2100' :
    variant === 'fragile'    ? '#2d0f0f' :
    variant === 'unresolved' ? '#111118' :
    isRoot                   ? '#1a1530' :
    isPrimary                ? '#151520' :
                               '#1c1c2e';

  const opacity =
    variant === 'fragile'    ? 0.5  :
    variant === 'unresolved' ? 0.55 :
    1.0;

  const strokeColor =
    variant === 'stable'    ? '#22c55e' :
    variant === 'uncertain' ? '#eab308' :
    variant === 'fragile'   ? '#ef4444' :
    isRoot                  ? '#c8a96e' :
                              bc;

  const strokeW = isRoot ? 2.5 : isPrimary ? 2 : 1.5;

  return (
    <motion.g
      transform={`translate(${position.x}, ${position.y})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: ANIMATION.nodeEnter.stiffness, damping: ANIMATION.nodeEnter.damping, delay: animationDelay }}
      style={{ cursor: isSecondary ? 'pointer' : 'default' }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={isSecondary ? onClick : undefined}
    >
      {/* Root pulse ring */}
      {isRoot && (
        <motion.circle r={r + 16} fill="none" stroke="#c8a96e" strokeWidth={1} opacity={0.2}
          animate={{ r: [r+16, r+22, r+16] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
      )}

      {/* Hover ring */}
      {isHovered && isSecondary && (
        <circle r={r + 12} fill={bc} opacity={0.1} />
      )}
      {isHovered && isSecondary && (
        <circle r={r + 12} fill="none" stroke={bc} strokeWidth={1.5} opacity={0.5} />
      )}

      {/* Expanded ring */}
      {isExpanded && (
        <circle r={r + 8} fill="none" stroke={bc} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
      )}

      {/* Node body */}
      <circle r={r} fill={bgFill} stroke={strokeColor} strokeWidth={strokeW} />

      {/* Inner glow */}
      <circle r={r * 0.55} fill={isRoot ? 'rgba(200,169,110,0.12)' : `${bc}22`} />

      {/* Speculative overlay */}
      {node.isSpeculative && (
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="3 3" />
      )}

      {/* Expanding spinner */}
      {isExpanding && (
        <motion.circle r={r + 4} fill="none" stroke={bc} strokeWidth={2}
          strokeDasharray={`${(r+4) * 2 * Math.PI * 0.28} 999`} strokeLinecap="round"
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '0 0' }} />
      )}

      {/* Title */}
      <text
        textAnchor="middle"
        dy={isSecondary ? '0.38em' : '0.1em'}
        fontSize={isRoot ? 12 : isPrimary ? 10 : 9}
        fontWeight={isRoot ? 700 : isPrimary ? 600 : 500}
        fontFamily="Inter, system-ui, sans-serif"
        fill={isRoot ? '#f5e6c8' : '#e8e8f8'}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {trunc(node.title, isRoot ? 20 : 13)}
      </text>

      {/* Insight on hover */}
      {isSecondary && isHovered && node.insight && (
        <motion.foreignObject x={-72} y={r + 8} width={144} height={36}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          <div style={{
            background: 'rgba(10,10,20,0.96)',
            border: `1px solid ${bc}66`,
            borderRadius: 5, padding: '4px 8px',
            fontSize: 8.5, fontWeight: 300, lineHeight: 1.4,
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(210,210,230,0.9)',
            textAlign: 'center',
          }}>
            {trunc(node.insight, 52)}
          </div>
        </motion.foreignObject>
      )}

      {/* + badge */}
      {isSecondary && isHovered && !isExpanded && !isExpanding && (
        <>
          <circle r={7} cx={r + 2} cy={-r - 2} fill={bc} />
          <text x={r + 2} y={-r - 2} textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight={800} fill="#0a0a14"
            style={{ pointerEvents: 'none', userSelect: 'none' }}>+</text>
        </>
      )}
    </motion.g>
  );
}

function trunc(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}
