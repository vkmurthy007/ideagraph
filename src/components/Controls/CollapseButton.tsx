import { motion } from 'framer-motion';

export function CollapseButton({ onCollapse, disabled }: { onCollapse: () => void; disabled?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: disabled ? 0.25 : 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}
    >
      <button onClick={onCollapse} disabled={disabled} style={{
        padding: '9px 28px', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.05)',
        color: 'rgba(210,210,220,0.85)',
        fontSize: 11, fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: 1.5, cursor: disabled ? 'default' : 'pointer',
        backdropFilter: 'blur(12px)', textTransform: 'uppercase',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) => { if (!disabled) { const b = e.currentTarget; b.style.borderColor='rgba(200,169,110,0.5)'; b.style.color='#f5e6c8'; b.style.boxShadow='0 2px 20px rgba(200,169,110,0.15)'; }}}
      onMouseLeave={(e) => { const b = e.currentTarget; b.style.borderColor='rgba(255,255,255,0.18)'; b.style.color='rgba(210,210,220,0.85)'; b.style.boxShadow='0 2px 20px rgba(0,0,0,0.3)'; }}
      >
        Collapse to Reality
      </button>
    </motion.div>
  );
}
