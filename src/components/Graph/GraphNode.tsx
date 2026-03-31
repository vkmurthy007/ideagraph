// src/components/Graph/GraphNode.tsx
import { motion } from 'framer-motion';
import type { GraphNode as GraphNodeType, StyleVariant, NodePosition } from '../../lib/types';
import { NODE_SIZE, BRANCH_COLORS, ANIMATION } from '../../lib/constants';
import styles from './GraphNode.module.css';

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

const VARIANT_CONFIG: Record<StyleVariant, { fill: string; stroke: string; opacity: number; textOpacity: number }> = {
  default:    { fill: '#2a2a2a', stroke: '#555555',  opacity: 1.00, textOpacity: 1.0  },
  unresolved: { fill: '#1e1e1e', stroke: '#383838',  opacity: 0.7,  textOpacity: 0.6  },
  stable:     { fill: '#1a3324', stroke: '#3a8a55',  opacity: 1.00, textOpacity: 1.0  },
  uncertain:  { fill: '#332d10', stroke: '#8a6e1a',  opacity: 0.85, textOpacity: 0.9  },
  fragile:    { fill: '#331414', stroke: '#8a2222',  opacity: 0.55, textOpacity: 0.7  },
};

export function GraphNode({
  node, position, variant, isHovered, isExpanded, isExpanding,
  onHoverStart, onHoverEnd, onClick, animationDelay = 0,
}: Props) {
  const r     = NODE_SIZE[node.type];
  const vc    = VARIANT_CONFIG[variant];
  const bc    = BRANCH_COLORS[node.branch];
  const isRoot      = node.type === 'root';
  const isPrimary   = node.type === 'primary';
  const isSecondary = node.type === 'secondary';

  return (
    <motion.g
      layoutId={node.id}
      transform={`translate(${position.x}, ${position.y})`}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: vc.opacity }}
      exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.18 } }}
      transition={{
        type: 'spring',
        stiffness: ANIMATION.nodeEnter.stiffness,
        damping: ANIMATION.nodeEnter.damping,
        delay: animationDelay,
        opacity: { duration: 0.25, delay: animationDelay },
      }}
      style={{ cursor: isSecondary ? 'pointer' : 'default' }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      onClick={isSecondary ? onClick : undefined}
      className={styles.node}
    >
      {/* Root accent rings */}
      {isRoot && (
        <>
          <motion.circle r={r + 12} fill="none" stroke="#c8a96e" strokeWidth={0.5} opacity={0.3}
            animate={{ r: [r + 12, r + 16, r + 12] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle r={r + 6} fill="none" stroke="#c8a96e" strokeWidth={0.8} opacity={0.35} />
        </>
      )}

      {/* Hover glow */}
      {isHovered && isSecondary && (
        <motion.circle r={r + 11} fill="none" stroke={bc} strokeWidth={1.5}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.15 }}
        />
      )}

      {/* Expanded indicator ring */}
      {isExpanded && (
        <circle r={r + 5} fill="none" stroke={bc} strokeWidth={1}
          strokeDasharray="3 3" opacity={0.6} />
      )}

      {/* Node body */}
      <circle
        r={r}
        fill={vc.fill}
        stroke={isRoot ? '#c8a96e' : isPrimary ? bc : vc.stroke}
        strokeWidth={isRoot ? 2 : isPrimary ? 1.5 : 1}
      />

      {/* Branch color accent dot */}
      {isSecondary && (
        <circle r={3} cx={r - 5} cy={-r + 5} fill={bc} opacity={0.9} />
      )}

      {/* Speculative dashed ring */}
      {node.isSpeculative && (
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.15)"
          strokeWidth={1} strokeDasharray="2.5 2.5" />
      )}

      {/* Expanding spinner */}
      {isExpanding && (
        <motion.circle
          r={r + 3} fill="none" stroke={bc} strokeWidth={1.5}
          strokeDasharray={`${(r + 3) * 2 * Math.PI * 0.3} ${(r + 3) * 2 * Math.PI * 0.7}`}
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '0 0' }}
          opacity={0.8}
        />
      )}

      {/* "+" expand affordance */}
      {isSecondary && !isExpanded && !isExpanding && isHovered && (
        <motion.text
          x={r - 1} y={-r + 2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fontWeight={400}
          fill={bc} opacity={0.9}
          initial={{ opacity: 0 }} animate={{ opacity: 0.9 }}
          transition={{ duration: 0.15 }}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >+</motion.text>
      )}

      {/* Title */}
      <text
        textAnchor="middle"
        dy={isSecondary ? '0.35em' : '-0.1em'}
        fontSize={isRoot ? 12 : isPrimary ? 11 : 9.5}
        fontWeight={isRoot ? 600 : isPrimary ? 500 : 400}
        fontFamily="Inter, system-ui, sans-serif"
        fill={isRoot ? '#ffffff' : isPrimary ? '#e0e0e0' : `rgba(220,220,220,${vc.textOpacity})`}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {truncate(node.title, isRoot ? 24 : 16)}
      </text>

      {/* Insight on hover */}
      {isSecondary && isHovered && node.insight && (
        <motion.text
          textAnchor="middle" dy="1.8em"
          fontSize={8} fontWeight={300}
          fontFamily="Inter, system-ui, sans-serif"
          fill="rgba(210,210,210,0.75)"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {truncate(node.insight, 34)}
        </motion.text>
      )}
    </motion.g>
  );
}

function truncate(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}
