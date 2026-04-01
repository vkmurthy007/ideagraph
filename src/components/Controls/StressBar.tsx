import { motion } from 'framer-motion';
import { useGraphStore } from '../../store/graphStore';
import { STRESS_DIMENSIONS } from '../../lib/constants';
import type { StressDimension } from '../../lib/types';

export function StressBar({ disabled }: { disabled?: boolean }) {
  const activeStress    = useGraphStore((s) => s.activeStress);
  const setActiveStress = useGraphStore((s) => s.setActiveStress);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: disabled ? 0.25 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 4, zIndex: 50,
        pointerEvents: disabled ? 'none' : 'auto',
        background: 'rgba(8,8,16,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8, padding: '5px 6px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}>
      <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 1.5,
        color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace',
        textTransform: 'uppercase', paddingLeft: 4, paddingRight: 6, borderRight: '1px solid rgba(255,255,255,0.08)' }}>
        STRESS
      </span>
      <div style={{ display: 'flex', gap: 3, paddingLeft: 2 }}>
        {STRESS_DIMENSIONS.map(({ id, label }) => {
          const active = activeStress === id;
          return (
            <button key={id}
              onClick={() => setActiveStress(active ? null : id as StressDimension)}
              style={{
                padding: '4px 11px', borderRadius: 5,
                border: `1px solid ${active ? 'rgba(200,169,110,0.6)' : 'transparent'}`,
                background: active ? 'rgba(200,169,110,0.15)' : 'transparent',
                color: active ? '#f5e6c8' : 'rgba(190,190,210,0.55)',
                fontSize: 10.5, fontWeight: active ? 600 : 400,
                fontFamily: 'Inter, sans-serif', letterSpacing: 0.2,
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}>
              {label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
