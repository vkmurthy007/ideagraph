// src/lib/seedGraph.ts
// Hardcoded graph used during Phase 1 development.
// Replace with live LLM generation in Phase 3.
// Idea: "AI agent for dermatology diagnosis across skin tones"

import type { GraphData } from './types';

export const SEED_GRAPH: GraphData = {
  nodes: [
    // Root
    {
      id: 'root',
      type: 'root',
      branch: 'user',
      title: 'Derm Diagnosis Agent',
      insight: 'A system that reads skin — and the humans who distrust it',
      breakPoint: 'Breaks here: no clear owner of the output → liability vacuum kills adoption',
      isSpeculative: false,
      stability: { trust: 0.5, scale: 0.6, latency: 0.7, retention: 0.5, cost: 0.5, regulation: 0.3 },
      originalInput: 'AI agent for dermatology diagnosis across skin tones',
    },

    // Primary nodes
    { id: 'p-user',       type: 'primary', branch: 'user',        title: 'User',        insight: '', breakPoint: '', isSpeculative: false, stability: { trust: 0.7, scale: 0.7, latency: 0.8, retention: 0.6, cost: 0.8, regulation: 0.5 } },
    { id: 'p-usecases',   type: 'primary', branch: 'useCases',    title: 'Use Cases',   insight: '', breakPoint: '', isSpeculative: false, stability: { trust: 0.6, scale: 0.6, latency: 0.6, retention: 0.6, cost: 0.6, regulation: 0.5 } },
    { id: 'p-systemtype', type: 'primary', branch: 'systemType',  title: 'System Type', insight: '', breakPoint: '', isSpeculative: false, stability: { trust: 0.5, scale: 0.5, latency: 0.5, retention: 0.5, cost: 0.5, regulation: 0.5 } },
    { id: 'p-value',      type: 'primary', branch: 'value',       title: 'Value',       insight: '', breakPoint: '', isSpeculative: false, stability: { trust: 0.6, scale: 0.7, latency: 0.7, retention: 0.6, cost: 0.6, regulation: 0.5 } },
    { id: 'p-risks',      type: 'primary', branch: 'risks',       title: 'Risks',       insight: '', breakPoint: '', isSpeculative: false, stability: { trust: 0.3, scale: 0.4, latency: 0.5, retention: 0.4, cost: 0.4, regulation: 0.2 } },
    { id: 'p-deps',       type: 'primary', branch: 'dependencies', title: 'Dependencies', insight: '', breakPoint: '', isSpeculative: false, stability: { trust: 0.5, scale: 0.4, latency: 0.4, retention: 0.5, cost: 0.3, regulation: 0.4 } },

    // User branch
    { id: 'u-1', type: 'secondary', branch: 'user', title: 'General patient', insight: 'Needs reassurance before results, not after', breakPoint: 'Breaks here: first output is wrong → user never returns', isSpeculative: false, stability: { trust: 0.2, scale: 0.8, latency: 0.7, retention: 0.3, cost: 0.9, regulation: 0.4 } },
    { id: 'u-2', type: 'secondary', branch: 'user', title: 'Clinician', insight: 'Requires auditability, not just accuracy', breakPoint: 'Breaks here: no explanation for output → clinician cannot co-sign', isSpeculative: false, stability: { trust: 0.5, scale: 0.7, latency: 0.8, retention: 0.7, cost: 0.8, regulation: 0.6 } },
    { id: 'u-3', type: 'secondary', branch: 'user', title: 'Underserved patient', insight: 'The highest-value user is also the hardest to reach', breakPoint: 'Breaks here: training data skews pale → model fails the intended user', isSpeculative: true, stability: { trust: 0.2, scale: 0.5, latency: 0.6, retention: 0.4, cost: 0.7, regulation: 0.5 } },

    // Use Cases branch
    { id: 'uc-1', type: 'secondary', branch: 'useCases', title: 'Diagnosis', insight: 'High stakes, zero tolerance for confident errors', breakPoint: 'Breaks here: false negative on melanoma → lawsuit and shutdown', isSpeculative: false, stability: { trust: 0.1, scale: 0.5, latency: 0.6, retention: 0.6, cost: 0.6, regulation: 0.1 } },
    { id: 'uc-2', type: 'secondary', branch: 'useCases', title: 'Triage support', insight: 'Lower risk, faster decision — the survivable wedge', breakPoint: 'Breaks here: triage escalates incorrectly → clinician loses confidence', isSpeculative: false, stability: { trust: 0.6, scale: 0.8, latency: 0.7, retention: 0.7, cost: 0.7, regulation: 0.5 } },
    { id: 'uc-3', type: 'secondary', branch: 'useCases', title: 'Education tool', insight: 'Highest trust, lowest liability — the real entry point', breakPoint: 'Breaks here: learners treat it as diagnostic truth → misuse compounds', isSpeculative: false, stability: { trust: 0.8, scale: 0.9, latency: 0.9, retention: 0.8, cost: 0.9, regulation: 0.8 } },
    { id: 'uc-4', type: 'secondary', branch: 'useCases', title: 'Cosmetic recs', insight: 'Low stakes but monetizable — keeps the lights on', breakPoint: 'Breaks here: product pushes to diagnosis adjacent content → liability bleeds in', isSpeculative: true, stability: { trust: 0.7, scale: 0.9, latency: 0.8, retention: 0.8, cost: 0.8, regulation: 0.6 } },

    // System Type branch
    { id: 'st-1', type: 'secondary', branch: 'systemType', title: 'Autonomous agent', insight: 'Maximum capability, maximum liability surface', breakPoint: 'Breaks here: autonomous output is wrong → no human in loop to catch it', isSpeculative: true, stability: { trust: 0.1, scale: 0.4, latency: 0.3, retention: 0.5, cost: 0.2, regulation: 0.1 } },
    { id: 'st-2', type: 'secondary', branch: 'systemType', title: 'Clinician copilot', insight: 'Human-in-loop keeps liability manageable', breakPoint: 'Breaks here: clinician rubber-stamps all outputs → liability shifts without safety gain', isSpeculative: false, stability: { trust: 0.7, scale: 0.6, latency: 0.6, retention: 0.7, cost: 0.5, regulation: 0.7 } },
    { id: 'st-3', type: 'secondary', branch: 'systemType', title: 'Retrieval system', insight: 'Shows its work — the most auditable form', breakPoint: 'Breaks here: retrieved references are outdated → confidence is misplaced', isSpeculative: false, stability: { trust: 0.8, scale: 0.7, latency: 0.5, retention: 0.6, cost: 0.6, regulation: 0.8 } },

    // Value branch
    { id: 'v-1', type: 'secondary', branch: 'value', title: 'Access parity', insight: 'Dermatology has a 6-month wait — this collapses it', breakPoint: 'Breaks here: rural users lack smartphones or data → the gap that existed persists', isSpeculative: true, stability: { trust: 0.5, scale: 0.8, latency: 0.7, retention: 0.7, cost: 0.6, regulation: 0.4 } },
    { id: 'v-2', type: 'secondary', branch: 'value', title: 'Faster triage', insight: 'Speed only matters if accuracy holds under pressure', breakPoint: 'Breaks here: speed metric crowds out accuracy metric → wrong tradeoff gets optimized', isSpeculative: false, stability: { trust: 0.6, scale: 0.8, latency: 0.9, retention: 0.7, cost: 0.8, regulation: 0.5 } },
    { id: 'v-3', type: 'secondary', branch: 'value', title: 'Bias correction', insight: 'Training on diverse skin tones is the actual differentiator', breakPoint: 'Breaks here: dataset diversity claimed but not verified → differentiation is marketing, not real', isSpeculative: true, stability: { trust: 0.4, scale: 0.6, latency: 0.7, retention: 0.6, cost: 0.5, regulation: 0.5 } },

    // Risks branch
    { id: 'r-1', type: 'secondary', branch: 'risks', title: 'Misdiagnosis', insight: 'A confident wrong answer is worse than no answer', breakPoint: 'Breaks here: high confidence score on incorrect output → user acts on it', isSpeculative: false, stability: { trust: 0.1, scale: 0.3, latency: 0.5, retention: 0.2, cost: 0.5, regulation: 0.1 } },
    { id: 'r-2', type: 'secondary', branch: 'risks', title: 'Trust collapse', insight: 'One visible failure poisons every future correct answer', breakPoint: 'Breaks here: public case of misdiagnosis → press coverage ends adoption curve', isSpeculative: false, stability: { trust: 0.1, scale: 0.4, latency: 0.6, retention: 0.1, cost: 0.6, regulation: 0.3 } },
    { id: 'r-3', type: 'secondary', branch: 'risks', title: 'Regulatory exposure', insight: 'FDA clears the device, not the company from liability', breakPoint: 'Breaks here: deployed before FDA clearance → cease and desist before scale', isSpeculative: false, stability: { trust: 0.4, scale: 0.4, latency: 0.6, retention: 0.4, cost: 0.4, regulation: 0.0 } },
    { id: 'r-4', type: 'secondary', branch: 'risks', title: 'Skin tone bias', insight: 'The population that needs this most is the one it fails', breakPoint: 'Breaks here: bias discovered post-launch → reputational damage is irreversible', isSpeculative: false, stability: { trust: 0.2, scale: 0.3, latency: 0.5, retention: 0.2, cost: 0.5, regulation: 0.2 } },

    // Dependencies branch
    { id: 'd-1', type: 'secondary', branch: 'dependencies', title: 'Diverse training data', insight: 'Without this the product is built on sand', breakPoint: 'Breaks here: dataset acquired but unlicensed → legal challenge shuts pipeline', isSpeculative: false, stability: { trust: 0.4, scale: 0.5, latency: 0.6, retention: 0.5, cost: 0.3, regulation: 0.3 } },
    { id: 'd-2', type: 'secondary', branch: 'dependencies', title: 'Clinical partnerships', insight: 'Clinicians who endorse it become the trust mechanism', breakPoint: 'Breaks here: clinician partner pulls endorsement → trust infrastructure collapses', isSpeculative: false, stability: { trust: 0.6, scale: 0.5, latency: 0.7, retention: 0.6, cost: 0.6, regulation: 0.7 } },
    { id: 'd-3', type: 'secondary', branch: 'dependencies', title: 'FDA clearance path', insight: 'The regulatory path determines the product shape, not vice versa', breakPoint: 'Breaks here: clearance requires clinical trials → 18 month delay kills runway', isSpeculative: false, stability: { trust: 0.5, scale: 0.4, latency: 0.5, retention: 0.5, cost: 0.2, regulation: 0.8 } },
    { id: 'd-4', type: 'secondary', branch: 'dependencies', title: 'Image quality baseline', insight: 'Phone camera variation is a real model degradation vector', breakPoint: 'Breaks here: model trained on clinical images → degrades on consumer smartphone photos', isSpeculative: false, stability: { trust: 0.5, scale: 0.6, latency: 0.7, retention: 0.6, cost: 0.7, regulation: 0.6 } },
  ],

  edges: [
    // Root → Primary
    { source: 'root', target: 'p-user',       type: 'hierarchical' },
    { source: 'root', target: 'p-usecases',   type: 'hierarchical' },
    { source: 'root', target: 'p-systemtype', type: 'hierarchical' },
    { source: 'root', target: 'p-value',      type: 'hierarchical' },
    { source: 'root', target: 'p-risks',      type: 'hierarchical' },
    { source: 'root', target: 'p-deps',       type: 'hierarchical' },

    // Primary → Secondary
    { source: 'p-user',       target: 'u-1',  type: 'hierarchical' },
    { source: 'p-user',       target: 'u-2',  type: 'hierarchical' },
    { source: 'p-user',       target: 'u-3',  type: 'hierarchical' },
    { source: 'p-usecases',   target: 'uc-1', type: 'hierarchical' },
    { source: 'p-usecases',   target: 'uc-2', type: 'hierarchical' },
    { source: 'p-usecases',   target: 'uc-3', type: 'hierarchical' },
    { source: 'p-usecases',   target: 'uc-4', type: 'hierarchical' },
    { source: 'p-systemtype', target: 'st-1', type: 'hierarchical' },
    { source: 'p-systemtype', target: 'st-2', type: 'hierarchical' },
    { source: 'p-systemtype', target: 'st-3', type: 'hierarchical' },
    { source: 'p-value',      target: 'v-1',  type: 'hierarchical' },
    { source: 'p-value',      target: 'v-2',  type: 'hierarchical' },
    { source: 'p-value',      target: 'v-3',  type: 'hierarchical' },
    { source: 'p-risks',      target: 'r-1',  type: 'hierarchical' },
    { source: 'p-risks',      target: 'r-2',  type: 'hierarchical' },
    { source: 'p-risks',      target: 'r-3',  type: 'hierarchical' },
    { source: 'p-risks',      target: 'r-4',  type: 'hierarchical' },
    { source: 'p-deps',       target: 'd-1',  type: 'hierarchical' },
    { source: 'p-deps',       target: 'd-2',  type: 'hierarchical' },
    { source: 'p-deps',       target: 'd-3',  type: 'hierarchical' },
    { source: 'p-deps',       target: 'd-4',  type: 'hierarchical' },

    // Cross-edges (causal, cross-branch)
    { source: 'u-2',  target: 'r-1',  type: 'causal', label: 'reveals' },
    { source: 'r-1',  target: 'r-2',  type: 'causal', label: 'accelerates' },
    { source: 'r-2',  target: 'uc-1', type: 'causal', label: 'blocks' },
    { source: 'd-1',  target: 'r-4',  type: 'causal', label: 'undermines' },
    { source: 'd-2',  target: 'st-2', type: 'causal', label: 'enables' },
    { source: 'd-3',  target: 'st-1', type: 'causal', label: 'blocks' },
    { source: 'uc-3', target: 'd-2',  type: 'causal', label: 'enables' },
    { source: 'v-3',  target: 'd-1',  type: 'causal', label: 'requires' },
  ],
};
