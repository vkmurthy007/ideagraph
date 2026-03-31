// src/store/graphStore.ts
import { create } from 'zustand';
import type {
  GraphNode,
  GraphEdge,
  NodePosition,
  StressDimension,
  StabilityMap,
  GenerationPhase,
  StyleVariant,
} from '../lib/types';

interface GraphState {
  // Data
  nodes: GraphNode[];
  edges: GraphEdge[];
  positions: Record<string, NodePosition>;
  idea: string;

  // UI
  activeStress: StressDimension | null;
  hoveredNodeId: string | null;
  expandedNodeIds: Set<string>;   // nodes currently expanded (depth loaded)
  expandingNodeId: string | null; // node currently loading expansion
  isCollapsed: boolean;
  generationPhase: GenerationPhase;
  seedInsight: string | null;

  // Actions — data
  setGraph: (nodes: GraphNode[], edges: GraphEdge[]) => void;
  setIdea: (idea: string) => void;
  addNode: (node: GraphNode) => void;
  addEdge: (edge: GraphEdge) => void;
  updateStability: (nodeId: string, stability: StabilityMap) => void;
  updateBreakPoint: (nodeId: string, breakPoint: string) => void;
  setPositions: (positions: Record<string, NodePosition>) => void;

  // Actions — UI
  setActiveStress: (dim: StressDimension | null) => void;
  setHoveredNode: (id: string | null) => void;
  setExpandingNode: (id: string | null) => void;
  markExpanded: (id: string) => void;
  setGenerationPhase: (phase: GenerationPhase) => void;
  collapseToReality: (insight: string) => void;
  reset: () => void;
}

const initialState = {
  nodes: [],
  edges: [],
  positions: {},
  idea: '',
  activeStress: null,
  hoveredNodeId: null,
  expandedNodeIds: new Set<string>(),
  expandingNodeId: null,
  isCollapsed: false,
  generationPhase: 'idle' as GenerationPhase,
  seedInsight: null,
};

export const useGraphStore = create<GraphState>((set) => ({
  ...initialState,

  setGraph:  (nodes, edges) => set({ nodes, edges }),
  setIdea:   (idea) => set({ idea }),
  addNode:   (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  addEdge:   (edge) => set((s) => ({ edges: [...s.edges, edge] })),

  updateStability: (nodeId, stability) =>
    set((s) => ({ nodes: s.nodes.map((n) => n.id === nodeId ? { ...n, stability } : n) })),

  updateBreakPoint: (nodeId, breakPoint) =>
    set((s) => ({ nodes: s.nodes.map((n) => n.id === nodeId ? { ...n, breakPoint } : n) })),

  setPositions: (positions) => set({ positions }),
  setActiveStress: (activeStress) => set({ activeStress }),
  setHoveredNode: (hoveredNodeId) => set({ hoveredNodeId }),

  setExpandingNode: (expandingNodeId) => set({ expandingNodeId }),

  markExpanded: (id) =>
    set((s) => ({ expandedNodeIds: new Set([...s.expandedNodeIds, id]) })),

  setGenerationPhase: (generationPhase) => set({ generationPhase }),

  collapseToReality: (insight) => set({ isCollapsed: true, seedInsight: insight }),

  reset: () => set({
    ...initialState,
    expandedNodeIds: new Set<string>(),
  }),
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectVisibleNodes = (nodes: GraphNode[], isCollapsed: boolean) =>
  isCollapsed ? nodes.filter((n) => !n.isSpeculative) : nodes;

export const selectVisibleEdges = (edges: GraphEdge[], visibleNodeIds: Set<string>) =>
  edges.filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));

export const selectNodeStyleVariant = (
  node: GraphNode,
  stress: StressDimension | null,
  generationPhase: GenerationPhase
): StyleVariant => {
  if (generationPhase === 'pass1') return 'unresolved';
  if (!stress || node.type !== 'secondary') return 'default';
  const score = node.stability[stress];
  if (score >= 0.7) return 'stable';
  if (score >= 0.4) return 'uncertain';
  return 'fragile';
};
