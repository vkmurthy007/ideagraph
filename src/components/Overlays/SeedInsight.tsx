// src/components/Overlays/SeedInsight.tsx
import { motion } from 'framer-motion';

interface Props {
  insight: string;
}

export function SeedInsight({ insight }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        pointerEvents: 'none',
        textAlign: 'center',
        maxWidth: 480,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 300,
          fontFamily: 'Inter, system-ui, sans-serif',
          color: 'rgba(200,169,110,0.85)',
          letterSpacing: 0.2,
          lineHeight: 1.6,
        }}
      >
        {insight}
      </p>
    </motion.div>
  );
}
