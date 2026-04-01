import type { StressDimension, BranchType } from './types';

export const STRESS_DIMENSIONS: { id: StressDimension; label: string }[] = [
  { id: 'trust',      label: 'Trust' },
  { id: 'scale',      label: 'Scale' },
  { id: 'latency',    label: 'Latency' },
  { id: 'retention',  label: 'Retention' },
  { id: 'cost',       label: 'Cost' },
  { id: 'regulation', label: 'Regulation' },
];

// Vivid, distinct branch colors — visible on dark background
export const BRANCH_COLORS: Record<BranchType, string> = {
  user:         '#60a5fa',  // blue
  useCases:     '#34d399',  // emerald
  systemType:   '#f472b6',  // pink
  value:        '#a78bfa',  // violet
  risks:        '#f87171',  // red
  dependencies: '#fbbf24',  // amber
};

export const FORCE_CONFIG = {
  linkDistanceHierarchical: 120,
  linkDistanceCausal:       200,
  chargeStrength:          -350,
  collisionRadius:          52,
  alphaDecay:               0.025,
} as const;

export const NODE_SIZE = {
  root:      32,
  primary:   20,
  secondary: 15,
} as const;

export const ANIMATION = {
  nodeEnter: { duration: 0.4, stiffness: 280, damping: 22 },
  edgeDraw:  600,
  stressTransition: 0.3,
  stagger: 0.06,
} as const;
