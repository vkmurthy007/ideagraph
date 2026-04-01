import { motion } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { STRESS_DIMENSIONS } from '../../lib/constants';
import type { StressDimension } from '../../lib/types';

export function StressBar({ disabled }: { disabled?: boolean }) {
  const activeStress   = useGraphStore((s) => s.activeStress);
  const setActiveStress = useGraphStore((s) => s.setActiveStress);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: disabled ? 0.3 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, zIndex: 50,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {STRESS_DIMENSIONS.map(({ id, label }) => {
        const active = activeStress === id;
        return (
          <button key={id}
            onClick={() => setActiveStress(active ? null : id as StressDimension)}
            style={{
              padding: '5px 14px', borderRadius: 20,
              border: `1px solid ${active ? 'rgba(200,169,110,0.7)' : 'rgba(255,255,255,0.15)'}`,
              background: active ? 'rgba(200,169,110,0.18)' : 'rgba(255,255,255,0.04)',
              color: active ? '#f5e6c8' : 'rgba(200,200,210,0.7)',
              fontSize: 11, fontWeight: active ? 500 : 400,
              fontFamily: 'Inter, sans-serif', letterSpacing: 0.3,
              cursor: 'pointer', transition: 'all 0.18s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: active ? '0 0 12px rgba(200,169,110,0.2)' : 'none',
            }}>
            {label}
          </button>
        );
      })}
    </motion.div>
  );
}
