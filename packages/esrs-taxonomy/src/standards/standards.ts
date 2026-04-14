import type { ESRSStandard } from '../types';

/**
 * The 12 European Sustainability Reporting Standards.
 * Source: EFRAG, Commission Delegated Regulation (EU) 2023/2772.
 */
export const ESRS_STANDARDS: ESRSStandard[] = [
  {
    code: 'ESRS_1',
    name: 'General Requirements',
    category: 'cross_cutting',
    isMandatory: true,
    description:
      'Sets the architecture of the ESRS framework: double materiality, qualitative characteristics, value chain scope, time horizons, and presentation requirements. Not a reporting standard itself — defines how to apply all other standards.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 1,
  },
  {
    code: 'ESRS_2',
    name: 'General Disclosures',
    category: 'cross_cutting',
    isMandatory: true,
    description:
      'Mandatory for ALL in-scope companies regardless of materiality assessment. Covers four pillars: Governance (GOV), Strategy & Business Model (SBM), Impact/Risk/Opportunity Management (IRO), and Metrics & Targets (MDR).',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 2,
  },
  {
    code: 'E1',
    name: 'Climate Change',
    category: 'environmental',
    isMandatory: false,
    description:
      'GHG emissions (Scope 1, 2, 3), energy consumption and mix, Paris-aligned transition plan, physical and transition climate risks, climate-related financial effects.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 3,
  },
  {
    code: 'E2',
    name: 'Pollution',
    category: 'environmental',
    isMandatory: false,
    description:
      'Air, water, and soil pollution; substances of concern and substances of very high concern; pollutant releases; remediation actions and costs.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 4,
  },
  {
    code: 'E3',
    name: 'Water and Marine Resources',
    category: 'environmental',
    isMandatory: false,
    description:
      'Water consumption and withdrawal; water intensity; water stress areas; impact on marine ecosystems; water management policies.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 5,
  },
  {
    code: 'E4',
    name: 'Biodiversity and Ecosystems',
    category: 'environmental',
    isMandatory: false,
    description:
      'Impact on biodiversity; ecosystem services dependency; land use change; species affected; biodiversity targets and action plans.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 6,
  },
  {
    code: 'E5',
    name: 'Resource Use and Circular Economy',
    category: 'environmental',
    isMandatory: false,
    description:
      'Resource inflows and outflows; waste generation and management; product design for circularity; recycled content; material efficiency.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 7,
  },
  {
    code: 'S1',
    name: 'Own Workforce',
    category: 'social',
    isMandatory: false,
    description:
      'Headcount and diversity; pay equity and adequate wages; working conditions; health and safety; training and skills development; collective bargaining; work-life balance.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 8,
  },
  {
    code: 'S2',
    name: 'Workers in the Value Chain',
    category: 'social',
    isMandatory: false,
    description:
      'Working conditions and rights of supply chain workers; forced labour and child labour screening; human rights due diligence in the value chain.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 9,
  },
  {
    code: 'S3',
    name: 'Affected Communities',
    category: 'social',
    isMandatory: false,
    description:
      'Local community impacts; indigenous peoples rights; economic, social, and cultural impacts of operations; community engagement.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 10,
  },
  {
    code: 'S4',
    name: 'Consumers and End-Users',
    category: 'social',
    isMandatory: false,
    description:
      'Product safety and quality; privacy and data protection; access and inclusion; responsible marketing; customer complaint mechanisms.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 11,
  },
  {
    code: 'G1',
    name: 'Business Conduct',
    category: 'governance',
    isMandatory: false,
    description:
      'Anti-corruption and bribery policies; whistleblower protection; political engagement and lobbying; supplier relationships and payment practices; corporate culture.',
    version: '2024.1',
    effectiveFrom: '2024-01-01',
    sortOrder: 12,
  },
];
