// src/components/Overlays/GenerationStatus.tsx
// Minimal status indicator shown during Pass 1 and Pass 2.
// Disappears when generation is complete — never clutters the final graph.

import { motion, AnimatePresence } from 'framer-motion';
import type { GenerationPhase } from '../../lib/types';

const MESSAGES: Record<string, string> = {
  pass1: 'Mapping structure…',
  pass2: 'Reading for fragility…',
};

interface Props {
  phase: GenerationPhase;
}

export function GenerationStatus({ phase }: Props) {
  const visible = phase === 'pass1' || phase === 'pass2';
  const message = MESSAGES[phase] ?? '';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Pulsing dot */}
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: 'rgba(200,169,110,0.6)',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 300,
              fontFamily: 'Inter, system-ui, sans-serif',
              color: 'rgba(180,180,180,0.5)',
              letterSpacing: 0.4,
            }}
          >
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
