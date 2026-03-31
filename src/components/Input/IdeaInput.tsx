// src/components/Input/IdeaInput.tsx
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onSubmit: (idea: string) => void;
}

const EXAMPLES = [
  'AI triage tool for rural clinics',
  'B2B compliance tool for fintechs',
  'Peer tutoring platform with AI matching',
  'Carbon tracking for SMB supply chains',
];

export function IdeaInput({ onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length < 4) return;
    onSubmit(trimmed);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f0f',
        zIndex: 200,
      }}
    >
      {/* Wordmark */}
      <motion.p
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          position: 'absolute',
          top: 28,
          left: 32,
          margin: 0,
          fontSize: 13,
          fontWeight: 500,
          fontFamily: 'Inter, system-ui, sans-serif',
          color: 'rgba(200,169,110,0.7)',
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        IdeaGraph
      </motion.p>

      <div style={{ width: '100%', maxWidth: 560, padding: '0 24px' }}>
        {/* Prompt */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            margin: '0 0 32px',
            fontSize: 15,
            fontWeight: 300,
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'rgba(200,200,200,0.55)',
            letterSpacing: 0.3,
            textAlign: 'center',
          }}
        >
          What are you thinking of building?
        </motion.h1>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          style={{
            border: `1px solid ${focused ? 'rgba(200,169,110,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.02)',
            transition: 'border-color 0.2s ease',
          }}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKey}
            placeholder="e.g. AI agent for dermatology diagnosis across skin tones"
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontWeight: 300,
              fontFamily: 'Inter, system-ui, sans-serif',
              color: '#e8e8e8',
              letterSpacing: 0.2,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={value.trim().length < 4}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: '1px solid rgba(200,169,110,0.35)',
              background: value.trim().length >= 4 ? 'rgba(200,169,110,0.1)' : 'transparent',
              color: value.trim().length >= 4 ? 'rgba(200,169,110,0.9)' : 'rgba(200,169,110,0.3)',
              fontSize: 11,
              fontFamily: 'Inter, system-ui, sans-serif',
              letterSpacing: 0.6,
              cursor: value.trim().length >= 4 ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
          >
            Explore →
          </button>
        </motion.div>

        {/* Examples */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            marginTop: 20,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setValue(ex); inputRef.current?.focus(); }}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'transparent',
                color: 'rgba(180,180,180,0.45)',
                fontSize: 10.5,
                fontFamily: 'Inter, system-ui, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                letterSpacing: 0.2,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = 'rgba(200,200,200,0.8)';
                (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = 'rgba(180,180,180,0.45)';
                (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
              }}
            >
              {ex}
            </button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
