// api/schemas.ts
// Zod schemas for validating LLM output before it reaches the client.
// Every node and edge that streams out must pass these.

import { z } from 'zod';

const StabilitySchema = z.object({
  trust:      z.number().min(0).max(1),
  scale:      z.number().min(0).max(1),
  latency:    z.number().min(0).max(1),
  retention:  z.number().min(0).max(1),
  cost:       z.number().min(0).max(1),
  regulation: z.number().min(0).max(1),
});

const DefaultStability = {
  trust: 0.5, scale: 0.5, latency: 0.5,
  retention: 0.5, cost: 0.5, regulation: 0.5,
};

export const GraphNodeSchema = z.object({
  id:           z.string().min(1).max(30),
  type:         z.enum(['root', 'primary', 'secondary']),
  branch:       z.enum(['user', 'useCases', 'systemType', 'value', 'risks', 'dependencies']),
  title:        z.string().min(1).max(50),
  insight:      z.string().max(150).default(''),
  breakPoint:   z.string().max(200).default(''),
  isSpeculative: z.boolean().default(false),
  stability:    StabilitySchema.default(DefaultStability),
  originalInput: z.string().optional(),
});

export const GraphEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  type:   z.enum(['hierarchical', 'causal']),
  label:  z.enum(['enables', 'blocks', 'accelerates', 'undermines', 'requires', 'reveals']).optional(),
});

// Pass 1 full response
export const Pass1ResponseSchema = z.object({
  root: GraphNodeSchema,
  branches: z.object({
    user:         z.array(GraphNodeSchema),
    useCases:     z.array(GraphNodeSchema),
    systemType:   z.array(GraphNodeSchema),
    value:        z.array(GraphNodeSchema),
    risks:        z.array(GraphNodeSchema),
    dependencies: z.array(GraphNodeSchema),
  }),
});

// Pass 2 full response
export const Pass2ResponseSchema = z.object({
  stability: z.record(StabilitySchema),
  breakPoints: z.record(z.string().max(200)),
  crossEdges: z.array(GraphEdgeSchema),
});

// Collapse response (just a string)
export const CollapseResponseSchema = z.string().min(10).max(300);

export type Pass1Response = z.infer<typeof Pass1ResponseSchema>;
export type Pass2Response = z.infer<typeof Pass2ResponseSchema>;
