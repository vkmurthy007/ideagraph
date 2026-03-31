// src/components/Controls/StressBar.tsx
import { motion } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { STRESS_DIMENSIONS } from '../../lib/constants';
import type { StressDimension } from '../../lib/types';

interface Props {
  disabled?: boolean;
}

export function StressBar({ disabled }: Props) {
  const activeStress = useGraphStore((s) => s.activeStress);
  const setActiveStress = useGraphStore((s) => s.setActiveStress);

  const toggle = (dim: StressDimension) => {
    setActiveStress(activeStress === dim ? null : dim);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: disabled ? 0.35 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      style={{
        position: 'fixed',
        top: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 6,
        zIndex: 50,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {STRESS_DIMENSIONS.map(({ id, label }) => {
        const active = activeStress === id;
        return (
          <button
            key={id}
            onClick={() => toggle(id)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: `1px solid ${active ? 'rgba(200,169,110,0.6)' : 'rgba(255,255,255,0.1)'}`,
              background: active ? 'rgba(200,169,110,0.12)' : 'rgba(255,255,255,0.03)',
              color: active ? 'rgba(200,169,110,0.95)' : 'rgba(180,180,180,0.6)',
              fontSize: 11,
              fontWeight: active ? 500 : 300,
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: 0.4,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
          >
            {label}
          </button>
        );
      })}
    </motion.div>
  );
}
