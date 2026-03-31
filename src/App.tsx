// src/App.tsx
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { IdeaInput } from './components/Input/IdeaInput';
import { GraphCanvas } from './components/Graph/GraphCanvas';
import { useGraphStore } from './store/graphStore';
import { useGraphStream } from './hooks/useGraphStream';
import { useUrlHash } from './hooks/useUrlHash';

const USE_SEED = import.meta.env.VITE_USE_SEED === 'true';

type AppPhase = 'input' | 'graph';

export function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('input');
  const reset = useGraphStore((s) => s.reset);
  const setGraph = useGraphStore((s) => s.setGraph);
  const setIdea = useGraphStore((s) => s.setIdea);
  const setGenerationPhase = useGraphStore((s) => s.setGenerationPhase);
  const { generate } = useGraphStream();
  const { decodeSession } = useUrlHash();

  // Attempt to restore from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 5) return;

    decodeSession(hash).then((session) => {
      if (!session || !session.nodes?.length) return;
      reset();
      setIdea(session.idea ?? '');
      setGraph(session.nodes as any, session.edges as any);
      setGenerationPhase('ready');
      setAppPhase('graph');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleIdeaSubmit = async (idea: string) => {
    setAppPhase('graph');

    if (USE_SEED) {
      const { SEED_GRAPH } = await import('./lib/seedGraph');
      reset();
      setIdea(idea);
      setGraph(SEED_GRAPH.nodes, SEED_GRAPH.edges);
      setGenerationPhase('ready');
    } else {
      await generate(idea);
    }
  };

  const handleReset = () => {
    reset();
    setAppPhase('input');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f0f0f', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {appPhase === 'input' ? (
          <IdeaInput key="input" onSubmit={handleIdeaSubmit} />
        ) : (
          <GraphCanvas key="graph" />
        )}
      </AnimatePresence>

      {appPhase === 'graph' && (
        <button
          onClick={handleReset}
          style={{
            position: 'fixed', top: 24, right: 28, zIndex: 100,
            background: 'transparent', border: 'none',
            color: 'rgba(150,150,150,0.4)', fontSize: 11,
            fontFamily: 'Inter, system-ui, sans-serif',
            cursor: 'pointer', letterSpacing: 0.5,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(200,200,200,0.7)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(150,150,150,0.4)')}
        >
          ← new idea
        </button>
      )}
    </div>
  );
}
