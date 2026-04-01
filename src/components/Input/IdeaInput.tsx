import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const EXAMPLES = [
  'AI triage tool for rural clinics',
  'B2B compliance platform for fintechs',
  'Peer tutoring app with AI matching',
  'Carbon tracker for SMB supply chains',
];

export function IdeaInput({ onSubmit }: { onSubmit: (idea: string) => void }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ready = value.trim().length >= 4;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 200,
      }}>

      {/* Top-left wordmark */}
      <div style={{ position: 'absolute', top: 24, left: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r="8" fill="none" stroke="#c8a96e" strokeWidth="1.2" />
          <circle cx="9" cy="9" r="3" fill="#c8a96e" opacity="0.8" />
          <line x1="9" y1="1" x2="9" y2="5" stroke="#c8a96e" strokeWidth="1" opacity="0.5" />
          <line x1="9" y1="13" x2="9" y2="17" stroke="#c8a96e" strokeWidth="1" opacity="0.5" />
          <line x1="1" y1="9" x2="5" y2="9" stroke="#c8a96e" strokeWidth="1" opacity="0.5" />
          <line x1="13" y1="9" x2="17" y2="9" stroke="#c8a96e" strokeWidth="1" opacity="0.5" />
        </svg>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: 'rgba(200,169,110,0.85)', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
          IdeaGraph
        </span>
      </div>

      {/* Top-right experiment tag */}
      <div style={{ position: 'absolute', top: 24, right: 28,
        fontSize: 9, fontWeight: 500, letterSpacing: 2,
        color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace',
        textTransform: 'uppercase' }}>
        STRUCTURE / EXPLORE
      </div>

      <div style={{ width: '100%', maxWidth: 560, padding: '0 32px' }}>

        {/* Main prompt */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: 3, color: 'rgba(200,169,110,0.6)',
            textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 14 }}>
            PRODUCT IDEA EXPLORER
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 300, color: 'rgba(230,230,245,0.9)',
            letterSpacing: -0.5, lineHeight: 1.3, fontFamily: 'Inter, sans-serif' }}>
            What are you thinking<br />of building?
          </h1>
        </motion.div>

        {/* Input field */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={{
            borderRadius: 8,
            border: `1px solid ${focused ? 'rgba(200,169,110,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center',
            transition: 'border-color 0.2s ease',
            boxShadow: focused ? '0 0 0 3px rgba(200,169,110,0.07), inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <input ref={inputRef} value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && ready && onSubmit(value.trim())}
              placeholder="describe your product idea…"
              autoFocus
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                padding: '15px 18px', fontSize: 14, fontWeight: 300,
                fontFamily: 'Inter, sans-serif', color: '#e0e0f0',
                letterSpacing: 0.1,
              }} />
            <button onClick={() => ready && onSubmit(value.trim())} disabled={!ready}
              style={{
                margin: '7px 8px', padding: '8px 22px', borderRadius: 6,
                border: 'none',
                background: ready ? '#c8a96e' : 'rgba(255,255,255,0.05)',
                color: ready ? '#080810' : 'rgba(255,255,255,0.2)',
                fontSize: 11, fontWeight: 700, letterSpacing: 1,
                fontFamily: 'Inter, sans-serif', cursor: ready ? 'pointer' : 'default',
                transition: 'all 0.2s ease', textTransform: 'uppercase',
                boxShadow: ready ? '0 2px 12px rgba(200,169,110,0.3)' : 'none',
              }}>
              Map it
            </button>
          </div>
        </motion.div>

        {/* Examples */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => { setValue(ex); inputRef.current?.focus(); }}
              style={{
                padding: '5px 13px', borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.02)',
                color: 'rgba(180,180,200,0.45)', fontSize: 10.5,
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                transition: 'all 0.15s ease', letterSpacing: 0.2,
              }}
              onMouseEnter={(e) => { const b = e.currentTarget; b.style.borderColor='rgba(200,169,110,0.3)'; b.style.color='rgba(200,169,110,0.8)'; b.style.background='rgba(200,169,110,0.06)'; }}
              onMouseLeave={(e) => { const b = e.currentTarget; b.style.borderColor='rgba(255,255,255,0.07)'; b.style.color='rgba(180,180,200,0.45)'; b.style.background='rgba(255,255,255,0.02)'; }}
            >
              {ex}
            </button>
          ))}
        </motion.div>

        {/* Bottom hint */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ textAlign: 'center', marginTop: 40, fontSize: 10, fontWeight: 400,
            color: 'rgba(255,255,255,0.18)', letterSpacing: 0.5, fontFamily: 'monospace' }}>
          reveals structure · maps dependencies · shows where it breaks
        </motion.p>
      </div>
    </motion.div>
  );
}
