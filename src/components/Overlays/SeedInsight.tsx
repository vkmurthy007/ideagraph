import { motion } from 'framer-motion';

export function SeedInsight({ insight }: { insight: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{
        position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, pointerEvents: 'none', textAlign: 'center', maxWidth: 520,
        padding: '12px 24px',
        background: 'rgba(8,8,16,0.9)',
        border: '1px solid rgba(200,169,110,0.25)',
        borderRadius: 8,
        backdropFilter: 'blur(12px)',
      }}>
      <p style={{ margin: 0, fontSize: 9, fontWeight: 600, letterSpacing: 2,
        color: 'rgba(200,169,110,0.5)', fontFamily: 'monospace', marginBottom: 6, textTransform: 'uppercase' }}>
        REALITY CHECK
      </p>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 300,
        fontFamily: 'Inter, sans-serif', color: 'rgba(200,185,155,0.9)',
        lineHeight: 1.6, letterSpacing: 0.1 }}>
        {insight}
      </p>
    </motion.div>
  );
}
