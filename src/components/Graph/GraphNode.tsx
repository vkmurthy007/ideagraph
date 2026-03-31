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
  default:    { fill: '#1a1a1a', stroke: '#2e2e2e',  opacity: 1.00, textOpacity: 0.85 },
  unresolved: { fill: '#141414', stroke: '#202020',  opacity: 0.55, textOpacity: 0.45 },
  stable:     { fill: '#1a2d22', stroke: '#2d5a3d',  opacity: 1.00, textOpacity: 0.90 },
  uncertain:  { fill: '#2a2415', stroke: '#5a4a1a',  opacity: 0.80, textOpacity: 0.75 },
  fragile:    { fill: '#2a1515', stroke: '#5a1a1a',  opacity: 0.48, textOpacity: 0.55 },
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

  // Pulse animation for expanding state
  const pulseAnim = isExpanding
    ? { scale: [1, 1.08, 1], transition: { duration: 1.1, repeat: Infinity } }
    : {};

  return (
    <motion.g
      layoutId={node.id}
      transform={`translate(${position.x}, ${position.y})`}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: vc.opacity, ...pulseAnim }}
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
          <motion.circle r={r + 12} fill="none" stroke="#c8a96e" strokeWidth={0.4} opacity={0.12}
            animate={{ r: [r + 12, r + 16, r + 12] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle r={r + 6} fill="none" stroke="#c8a96e" strokeWidth={0.6} opacity={0.2} />
        </>
      )}

      {/* Hover glow ring */}
      {isHovered && isSecondary && (
        <motion.circle r={r + 11} fill="none" stroke={bc} strokeWidth={1}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 0.15 }}
        />
      )}

      {/* Expanded indicator ring */}
      {isExpanded && (
        <circle r={r + 5} fill="none" stroke={bc} strokeWidth={0.8}
          strokeDasharray="3 3" opacity={0.5} />
      )}

      {/* Node body */}
      <circle
        r={r}
        fill={vc.fill}
        stroke={isRoot ? '#c8a96e' : isPrimary ? bc + 'aa' : vc.stroke}
        strokeWidth={isRoot ? 1.5 : isPrimary ? 1.1 : 0.8}
      />

      {/* Branch color accent dot — secondary only */}
      {isSecondary && (
        <circle r={2.5} cx={r - 4} cy={-r + 4} fill={bc} opacity={0.75} />
      )}

      {/* Speculative dashed ring */}
      {node.isSpeculative && !isExpanded && (
        <circle r={r} fill="none" stroke="rgba(255,255,255,0.07)"
          strokeWidth={1} strokeDasharray="2.5 2.5" />
      )}

      {/* Expanding spinner arc */}
      {isExpanding && (
        <motion.circle
          r={r + 2} fill="none" stroke={bc} strokeWidth={1.2}
          strokeDasharray={`${(r + 2) * 2 * Math.PI * 0.3} ${(r + 2) * 2 * Math.PI * 0.7}`}
          strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '0 0' }}
          opacity={0.7}
        />
      )}

      {/* Click affordance "+" for expandable nodes */}
      {isSecondary && !isExpanded && !isExpanding && isHovered && (
        <motion.text
          x={r - 1} y={-r + 1}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={8} fontWeight={300}
          fill={bc} opacity={0.8}
          initial={{ opacity: 0 }} animate={{ opacity: 0.8 }}
          transition={{ duration: 0.15 }}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          +
        </motion.text>
      )}

      {/* Title */}
      <text
        textAnchor="middle"
        dy={isSecondary ? '0.35em' : '-0.1em'}
        fontSize={isRoot ? 11 : isPrimary ? 10 : 9}
        fontWeight={isRoot ? 600 : isPrimary ? 500 : 400}
        fontFamily="Inter, system-ui, sans-serif"
        fill={isRoot ? '#e8e8e8' : `rgba(200,200,200,${vc.textOpacity})`}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {truncate(node.title, isRoot ? 24 : 16)}
      </text>

      {/* Insight — secondary, on hover */}
      {isSecondary && isHovered && node.insight && (
        <motion.text
          textAnchor="middle" dy="1.7em"
          fontSize={7.5} fontWeight={300}
          fontFamily="Inter, system-ui, sans-serif"
          fill="rgba(190,190,190,0.6)"
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
