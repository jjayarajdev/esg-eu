import type { DepartmentTemplate } from '../types';

/**
 * Default department templates based on the AkzoNobel enterprise model.
 * These are seeded as defaults when a new tenant is provisioned.
 * Tenants can customize their department structure and ESRS mappings.
 */
export const DEPARTMENT_TEMPLATES: DepartmentTemplate[] = [
  {
    name: 'Health, Safety, Environment & Security',
    code: 'HSES',
    description: 'Owns environmental data collection including emissions, energy, water, pollution, and product safety.',
    defaultKpiPct: 44,
    defaultStandards: ['ESRS_2', 'E1', 'E2', 'E3', 'E5'],
    sortOrder: 1,
  },
  {
    name: 'Human Resources',
    code: 'HR',
    description: 'Owns workforce data including headcount, diversity, pay equity, health & safety, training, and collective bargaining.',
    defaultKpiPct: 22,
    defaultStandards: ['ESRS_2', 'S1'],
    sortOrder: 2,
  },
  {
    name: 'Sustainability',
    code: 'SUSTAINABILITY',
    description: 'Owns cross-cutting sustainability metrics, EU Taxonomy alignment, Scope 3 emissions, and value chain reporting.',
    defaultKpiPct: 15,
    defaultStandards: ['ESRS_2', 'E1', 'E5', 'S1', 'S2'],
    sortOrder: 3,
  },
  {
    name: 'Procurement',
    code: 'PROCUREMENT',
    description: 'Owns supply chain data including value chain workers, supplier assessments, and procurement-related environmental data.',
    defaultKpiPct: 13,
    defaultStandards: ['E1', 'E5', 'S2'],
    sortOrder: 4,
  },
  {
    name: 'Legal',
    code: 'LEGAL',
    description: 'Owns governance data including anti-corruption, whistleblower mechanisms, political engagement, and business conduct.',
    defaultKpiPct: 4,
    defaultStandards: ['G1'],
    sortOrder: 5,
  },
  {
    name: 'Product Safety & Regulatory Affairs',
    code: 'PSRA',
    description: 'Owns product-related environmental data including circularity, substances of concern, and product safety.',
    defaultKpiPct: 2,
    defaultStandards: ['E5'],
    sortOrder: 6,
  },
];
