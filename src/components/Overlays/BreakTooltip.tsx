// src/components/Overlays/BreakTooltip.tsx
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphNode, NodePosition } from '../../lib/types';

interface Props {
  node: GraphNode | null;
  position: NodePosition | null;
}

export function BreakTooltip({ node, position }: Props) {
  const visible = !!(node && position && node.breakPoint && node.type === 'secondary');

  return (
    <AnimatePresence>
      {visible && node && position && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            left: position.x + 20,
            top: position.y - 12,
            pointerEvents: 'none',
            zIndex: 100,
            maxWidth: 260,
          }}
        >
          <div
            style={{
              background: 'rgba(14,14,14,0.96)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              padding: '8px 12px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 300,
                fontFamily: 'Inter, system-ui, sans-serif',
                color: 'rgba(220,200,170,0.9)',
                lineHeight: 1.5,
                letterSpacing: 0.1,
              }}
            >
              {node.breakPoint}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
