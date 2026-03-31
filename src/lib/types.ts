// src/lib/types.ts — single source of truth for all types
// Update this file before updating components or store

export type StressDimension =
  | 'trust'
  | 'scale'
  | 'latency'
  | 'retention'
  | 'cost'
  | 'regulation';

export type NodeType = 'root' | 'primary' | 'secondary';

export type BranchType =
  | 'user'
  | 'useCases'
  | 'systemType'
  | 'value'
  | 'risks'
  | 'dependencies';

export type EdgeType = 'hierarchical' | 'causal';

export type StyleVariant = 'default' | 'stable' | 'uncertain' | 'fragile' | 'unresolved';

export type GenerationPhase = 'idle' | 'pass1' | 'pass2' | 'ready';

export type EdgeLabel =
  | 'enables'
  | 'blocks'
  | 'accelerates'
  | 'undermines'
  | 'requires'
  | 'reveals';

export type StabilityMap = Record<StressDimension, number>;

export interface GraphNode {
  id: string;
  type: NodeType;
  branch: BranchType;
  title: string;
  insight: string;
  breakPoint: string;
  isSpeculative: boolean;
  stability: StabilityMap;
  // Root node extras
  originalInput?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  label?: EdgeLabel;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NodePosition {
  x: number;
  y: number;
}

// SSE event types from backend
export type SSEEvent =
  | { type: 'node'; payload: Partial<GraphNode> }
  | { type: 'edge'; payload: GraphEdge }
  | { type: 'stability'; payload: { nodeId: string; stability: StabilityMap } }
  | { type: 'breakpoint'; payload: { nodeId: string; breakPoint: string } }
  | { type: 'crossedge'; payload: GraphEdge }
  | { type: 'seed'; payload: { insight: string } }
  | { type: 'done'; payload: null }
  | { type: 'error'; payload: { message: string } };
