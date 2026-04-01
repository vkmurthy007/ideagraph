import { motion, AnimatePresence } from 'framer-motion';
import type { GraphNode, NodePosition } from '../../lib/types';
import { BRANCH_COLORS } from '../../lib/constants';

interface Props { node: GraphNode | null; position: NodePosition | null; }

export function BreakTooltip({ node, position }: Props) {
  const visible = !!(node && position && node.breakPoint && node.type === 'secondary');
  const bc = node ? BRANCH_COLORS[node.branch] : '#888';

  return (
    <AnimatePresence>
      {visible && node && position && (
        <motion.div key={node.id}
          initial={{ opacity: 0, y: 4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.98 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'fixed', left: position.x + 16, top: position.y - 8,
            pointerEvents: 'none', zIndex: 100, maxWidth: 280,
          }}>
          <div style={{
            background: 'rgba(8,8,16,0.97)',
            border: `1px solid ${bc}44`,
            borderLeft: `2px solid ${bc}`,
            borderRadius: 6, padding: '10px 14px',
            backdropFilter: 'blur(12px)',
            boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)`,
          }}>
            <p style={{ margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: 1.5,
              color: `${bc}cc`, fontFamily: 'monospace', marginBottom: 6, textTransform: 'uppercase' }}>
              BREAK POINT
            </p>
            <p style={{ margin: 0, fontSize: 11.5, fontWeight: 300,
              fontFamily: 'Inter, sans-serif', color: 'rgba(220,210,200,0.92)',
              lineHeight: 1.55, letterSpacing: 0.1 }}>
              {node.breakPoint}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
