// src/lib/constants.ts

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
  user:         '#7B9EA8',
  useCases:     '#8A9E7B',
  systemType:   '#9E8A7B',
  value:        '#7B8A9E',
  risks:        '#9E7B7B',
  dependencies: '#9A8FAD',
};

export const FORCE_CONFIG = {
  linkDistanceHierarchical: 110,
  linkDistanceCausal:       190,
  chargeStrength:          -320,
  collisionRadius:          48,
  alphaDecay:               0.025,
} as const;

export const NODE_SIZE = {
  root:      28,
  primary:   18,
  secondary: 13,
} as const;

export const ANIMATION = {
  nodeEnter: { duration: 0.4, stiffness: 300, damping: 25 },
  edgeDraw:  600,
  stressTransition: 0.28,
  stagger: 0.07,
} as const;
