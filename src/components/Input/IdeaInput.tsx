import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const EXAMPLES = [
  'AI triage tool for rural clinics',
  'B2B compliance tool for fintechs',
  'Peer tutoring platform with AI matching',
  'Carbon tracking for SMB supply chains',
];

export function IdeaInput({ onSubmit }: { onSubmit: (idea: string) => void }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ready = value.trim().length >= 4;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 40%, #0f0f1e 0%, #0a0a0f 70%)',
        zIndex: 200,
      }}>

      {/* Wordmark */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ position: 'absolute', top: 28, left: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c8a96e', opacity: 0.8 }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, color: 'rgba(200,169,110,0.8)', textTransform: 'uppercase' }}>
          IdeaGraph
        </span>
      </motion.div>

      <div style={{ width: '100%', maxWidth: 580, padding: '0 28px' }}>
        {/* Heading */}
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginBottom: 40, fontSize: 16, fontWeight: 300,
            color: 'rgba(200,200,220,0.6)', letterSpacing: 0.3, lineHeight: 1.6 }}>
          What are you thinking of building?
        </motion.p>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{
            borderRadius: 12, overflow: 'hidden',
            border: `1px solid ${focused ? 'rgba(200,169,110,0.45)' : 'rgba(255,255,255,0.12)'}`,
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center',
            boxShadow: focused ? '0 0 0 3px rgba(200,169,110,0.08)' : 'none',
            transition: 'all 0.2s ease',
          }}>
          <input ref={inputRef} value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && ready && onSubmit(value.trim())}
            placeholder="e.g. AI agent for dermatology diagnosis across skin tones"
            autoFocus
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              padding: '16px 20px', fontSize: 14, fontWeight: 300,
              fontFamily: 'Inter, sans-serif', color: '#e8e8f0', letterSpacing: 0.2,
            }} />
          <button onClick={() => ready && onSubmit(value.trim())} disabled={!ready}
            style={{
              margin: '6px 8px', padding: '8px 20px', borderRadius: 8,
              border: 'none', background: ready ? 'rgba(200,169,110,0.85)' : 'rgba(255,255,255,0.06)',
              color: ready ? '#0a0a0f' : 'rgba(255,255,255,0.25)',
              fontSize: 12, fontWeight: 600, letterSpacing: 0.5,
              fontFamily: 'Inter, sans-serif', cursor: ready ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}>
            Explore
          </button>
        </motion.div>

        {/* Examples */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => { setValue(ex); inputRef.current?.focus(); }}
              style={{
                padding: '5px 14px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'transparent',
                color: 'rgba(180,180,200,0.5)', fontSize: 11,
                fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { const b = e.currentTarget; b.style.color='rgba(210,210,230,0.85)'; b.style.borderColor='rgba(255,255,255,0.18)'; b.style.background='rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { const b = e.currentTarget; b.style.color='rgba(180,180,200,0.5)'; b.style.borderColor='rgba(255,255,255,0.08)'; b.style.background='transparent'; }}
            >
              {ex}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
