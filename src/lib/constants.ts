
import type { StressDimension, BranchType } from './types';

export const STRESS_DIMENSIONS: { id: StressDimension; label: string }[] = [
  { id: 'trust',      label: 'Trust' },
  { id: 'scale',      label: 'Scale' },
  { id: 'latency',    label: 'Latency' },
  { id: 'retention',  label: 'Retention' },
  { id: 'cost',       label: 'Cost' },
  { id: 'regulation', label: 'Regulation' },
];

export const BRANCH_COLORS: Record<BranchType, string> = {
  user:         '#60a5fa',
  useCases:     '#34d399',
  systemType:   '#f472b6',
  value:        '#a78bfa',
  risks:        '#f87171',
  dependencies: '#fbbf24',
};

export const FORCE_CONFIG = {
  linkDistanceHierarchical: 140,
  linkDistanceCausal:       220,
  chargeStrength:          -600,
  collisionRadius:          80,
  alphaDecay:               0.022,
} as const;

export const NODE_SIZE = {
  root:      32,
  primary:   20,
  secondary: 15,
} as const;

export const ANIMATION = {
  nodeEnter: { duration: 0.4, stiffness: 260, damping: 22 },
  edgeDraw:  600,
  stressTransition: 0.3,
  stagger: 0.06,
} as const;
