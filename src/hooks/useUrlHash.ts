// src/hooks/useUrlHash.ts
// Q-007 from ask.md: URL-hash sharing.
// Encodes the graph state (idea + nodes + edges) into the URL hash on generation complete.
// On page load, decodes and restores the session — no backend needed.
//
// Format: #v1:<base64(gzip-compressed JSON)>
// Falls back silently if encoding/decoding fails — never blocks the core flow.

import { useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';

const VERSION = 'v1';
const MAX_HASH_BYTES = 8000; // ~8KB — safe for most browsers

interface SerializedSession {
  idea: string;
  nodes: unknown[];
  edges: unknown[];
}

// ─── Encode ───────────────────────────────────────────────────────────────────

async function encodeSession(session: SerializedSession): Promise<string | null> {
  try {
    const json = JSON.stringify(session);
    if (json.length > MAX_HASH_BYTES * 2) return null; // Too large — skip

    // Use CompressionStream if available (modern browsers)
    if (typeof CompressionStream !== 'undefined') {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new TextEncoder().encode(json));
      writer.close();

      const chunks: Uint8Array[] = [];
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        if (value) chunks.push(value);
        done = d;
      }

      const compressed = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
      let offset = 0;
      for (const chunk of chunks) { compressed.set(chunk, offset); offset += chunk.length; }

      const b64 = btoa(String.fromCharCode(...compressed));
      if (b64.length > MAX_HASH_BYTES) return null;
      return `${VERSION}:${b64}`;
    }

    // Fallback: uncompressed base64
    const b64 = btoa(unescape(encodeURIComponent(json)));
    if (b64.length > MAX_HASH_BYTES) return null;
    return `${VERSION}:${b64}`;
  } catch {
    return null;
  }
}

// ─── Decode ───────────────────────────────────────────────────────────────────

async function decodeSession(hash: string): Promise<SerializedSession | null> {
  try {
    if (!hash.startsWith('#')) return null;
    const content = hash.slice(1);
    const colonIdx = content.indexOf(':');
    if (colonIdx === -1) return null;

    const version = content.slice(0, colonIdx);
    if (version !== VERSION) return null;

    const b64 = content.slice(colonIdx + 1);
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    if (typeof DecompressionStream !== 'undefined') {
      try {
        const stream = new DecompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(bytes);
        writer.close();

        const chunks: Uint8Array[] = [];
        let done = false;
        while (!done) {
          const { value, done: d } = await reader.read();
          if (value) chunks.push(value);
          done = d;
        }

        const decompressed = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
        let off = 0;
        for (const c of chunks) { decompressed.set(c, off); off += c.length; }

        const json = new TextDecoder().decode(decompressed);
        return JSON.parse(json) as SerializedSession;
      } catch {
        // Wasn't gzip — fall through to plain base64
      }
    }

    // Fallback: plain base64
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as SerializedSession;
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Two behaviors:
 * 1. On generationPhase → 'ready': encode current graph into URL hash
 * 2. Returns `restoreFromHash()` for App to call on mount
 */
export function useUrlHash() {
  const generationPhase = useGraphStore((s) => s.generationPhase);
  const nodes           = useGraphStore((s) => s.nodes);
  const edges           = useGraphStore((s) => s.edges);
  const idea            = useGraphStore((s) => s.idea);

  // Write hash when graph is ready
  useEffect(() => {
    if (generationPhase !== 'ready' || nodes.length === 0) return;

    encodeSession({ idea, nodes, edges }).then((hash) => {
      if (hash) {
        window.history.replaceState(null, '', `#${hash}`);
      }
    });
  }, [generationPhase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear hash on reset
  useEffect(() => {
    if (generationPhase === 'idle') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [generationPhase]);

  return { decodeSession };
}
