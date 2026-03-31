// src/components/Controls/CollapseButton.tsx
import { motion } from 'framer-motion';

interface Props {
  onCollapse: () => void;
  disabled?: boolean;
}

export function CollapseButton({ onCollapse, disabled }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: disabled ? 0.3 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
      }}
    >
      <button
        onClick={onCollapse}
        disabled={disabled}
        style={{
          padding: '8px 24px',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(200,200,200,0.7)',
          fontSize: 11,
          fontWeight: 400,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: 0.8,
          cursor: disabled ? 'default' : 'pointer',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.2s ease',
          textTransform: 'uppercase',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            (e.target as HTMLButtonElement).style.borderColor = 'rgba(200,169,110,0.35)';
            (e.target as HTMLButtonElement).style.color = 'rgba(200,169,110,0.8)';
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
          (e.target as HTMLButtonElement).style.color = 'rgba(200,200,200,0.7)';
        }}
      >
        Collapse to Reality
      </button>
    </motion.div>
  );
}
