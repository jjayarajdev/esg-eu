import type { ESRSDisclosureRequirement } from '../types';

/**
 * ESRS Disclosure Requirements — the sub-sections within each standard.
 * Each disclosure requirement groups related metrics/datapoints.
 */
export const ESRS_DISCLOSURE_REQUIREMENTS: ESRSDisclosureRequirement[] = [
  // ═══════════════════════════════════════════════════════════════
  // ESRS 2 — General Disclosures (mandatory, four pillars)
  // ═══════════════════════════════════════════════════════════════

  // GOV Pillar
  { code: 'GOV-1', standardCode: 'ESRS_2', name: 'The role of the administrative, management and supervisory bodies', pillar: 'GOV', isMandatory: true, description: 'Board and management sustainability oversight, roles, and responsibilities.', version: '2024.1', sortOrder: 1 },
  { code: 'GOV-2', standardCode: 'ESRS_2', name: 'Information provided to and sustainability matters addressed by the undertaking\'s administrative, management and supervisory bodies', pillar: 'GOV', isMandatory: true, description: 'How sustainability topics are addressed at board level.', version: '2024.1', sortOrder: 2 },
  { code: 'GOV-3', standardCode: 'ESRS_2', name: 'Integration of sustainability-related performance in incentive schemes', pillar: 'GOV', isMandatory: true, description: 'Sustainability-linked remuneration and incentive structures.', version: '2024.1', sortOrder: 3 },
  { code: 'GOV-4', standardCode: 'ESRS_2', name: 'Statement on due diligence', pillar: 'GOV', isMandatory: true, description: 'Due diligence processes for sustainability matters.', version: '2024.1', sortOrder: 4 },
  { code: 'GOV-5', standardCode: 'ESRS_2', name: 'Risk management and internal controls over sustainability reporting', pillar: 'GOV', isMandatory: true, description: 'Internal control systems for sustainability data quality.', version: '2024.1', sortOrder: 5 },

  // SBM Pillar
  { code: 'SBM-1', standardCode: 'ESRS_2', name: 'Strategy, business model and value chain', pillar: 'SBM', isMandatory: true, description: 'Overview of strategy, business model, and value chain.', version: '2024.1', sortOrder: 6 },
  { code: 'SBM-2', standardCode: 'ESRS_2', name: 'Interests and views of stakeholders', pillar: 'SBM', isMandatory: true, description: 'How stakeholder interests are considered in strategy.', version: '2024.1', sortOrder: 7 },
  { code: 'SBM-3', standardCode: 'ESRS_2', name: 'Material impacts, risks and opportunities and their interaction with strategy and business model', pillar: 'SBM', isMandatory: true, description: 'How material sustainability matters affect strategy.', version: '2024.1', sortOrder: 8 },

  // IRO Pillar
  { code: 'IRO-1', standardCode: 'ESRS_2', name: 'Description of the processes to identify and assess material impacts, risks and opportunities', pillar: 'IRO', isMandatory: true, description: 'Double materiality assessment methodology and process.', version: '2024.1', sortOrder: 9 },
  { code: 'IRO-2', standardCode: 'ESRS_2', name: 'Disclosure requirements in ESRS covered by the undertaking\'s sustainability statement', pillar: 'IRO', isMandatory: true, description: 'List of material topics and which ESRS disclosures are covered.', version: '2024.1', sortOrder: 10 },

  // ═══════════════════════════════════════════════════════════════
  // E1 — Climate Change
  // ═══════════════════════════════════════════════════════════════
  { code: 'E1-1', standardCode: 'E1', name: 'Transition plan for climate change mitigation', pillar: null, isMandatory: false, description: 'Paris-aligned transition plan with targets and timelines.', version: '2024.1', sortOrder: 11 },
  { code: 'E1-2', standardCode: 'E1', name: 'Policies related to climate change mitigation and adaptation', pillar: null, isMandatory: false, description: 'Climate-related policies and commitments.', version: '2024.1', sortOrder: 12 },
  { code: 'E1-3', standardCode: 'E1', name: 'Actions and resources related to climate change policies', pillar: null, isMandatory: false, description: 'Actions taken and resources allocated for climate change.', version: '2024.1', sortOrder: 13 },
  { code: 'E1-4', standardCode: 'E1', name: 'Targets related to climate change mitigation and adaptation', pillar: null, isMandatory: false, description: 'Climate targets with base year, target year, and progress.', version: '2024.1', sortOrder: 14 },
  { code: 'E1-5', standardCode: 'E1', name: 'Energy consumption and mix', pillar: null, isMandatory: false, description: 'Total energy consumption, renewable vs non-renewable, energy intensity.', version: '2024.1', sortOrder: 15 },
  { code: 'E1-6', standardCode: 'E1', name: 'Gross Scopes 1, 2, 3 and Total GHG emissions', pillar: null, isMandatory: false, description: 'GHG emissions by scope per GHG Protocol.', version: '2024.1', sortOrder: 16 },
  { code: 'E1-7', standardCode: 'E1', name: 'GHG removals and GHG mitigation projects financed through carbon credits', pillar: null, isMandatory: false, description: 'Carbon removals and offsets used.', version: '2024.1', sortOrder: 17 },
  { code: 'E1-8', standardCode: 'E1', name: 'Internal carbon pricing', pillar: null, isMandatory: false, description: 'Internal carbon pricing schemes and shadow prices.', version: '2024.1', sortOrder: 18 },
  { code: 'E1-9', standardCode: 'E1', name: 'Anticipated financial effects from material physical and transition risks and potential climate-related opportunities', pillar: null, isMandatory: false, description: 'Financial impact of climate risks and opportunities.', version: '2024.1', sortOrder: 19 },

  // ═══════════════════════════════════════════════════════════════
  // E2 — Pollution
  // ═══════════════════════════════════════════════════════════════
  { code: 'E2-1', standardCode: 'E2', name: 'Policies related to pollution', pillar: null, isMandatory: false, description: 'Pollution prevention and control policies.', version: '2024.1', sortOrder: 20 },
  { code: 'E2-2', standardCode: 'E2', name: 'Actions and resources related to pollution', pillar: null, isMandatory: false, description: 'Actions to prevent and remediate pollution.', version: '2024.1', sortOrder: 21 },
  { code: 'E2-3', standardCode: 'E2', name: 'Targets related to pollution', pillar: null, isMandatory: false, description: 'Pollution reduction targets.', version: '2024.1', sortOrder: 22 },
  { code: 'E2-4', standardCode: 'E2', name: 'Pollution of air, water and soil', pillar: null, isMandatory: false, description: 'Pollutant emissions to air, water, and soil.', version: '2024.1', sortOrder: 23 },
  { code: 'E2-5', standardCode: 'E2', name: 'Substances of concern and substances of very high concern', pillar: null, isMandatory: false, description: 'Use and release of substances of concern.', version: '2024.1', sortOrder: 24 },
  { code: 'E2-6', standardCode: 'E2', name: 'Anticipated financial effects from material pollution-related risks and opportunities', pillar: null, isMandatory: false, description: 'Financial effects of pollution risks.', version: '2024.1', sortOrder: 25 },

  // ═══════════════════════════════════════════════════════════════
  // E3 — Water and Marine Resources
  // ═══════════════════════════════════════════════════════════════
  { code: 'E3-1', standardCode: 'E3', name: 'Policies related to water and marine resources', pillar: null, isMandatory: false, description: 'Water and marine resources management policies.', version: '2024.1', sortOrder: 26 },
  { code: 'E3-2', standardCode: 'E3', name: 'Actions and resources related to water and marine resources', pillar: null, isMandatory: false, description: 'Actions for water stewardship and marine protection.', version: '2024.1', sortOrder: 27 },
  { code: 'E3-3', standardCode: 'E3', name: 'Targets related to water and marine resources', pillar: null, isMandatory: false, description: 'Water reduction and marine resource targets.', version: '2024.1', sortOrder: 28 },
  { code: 'E3-4', standardCode: 'E3', name: 'Water consumption', pillar: null, isMandatory: false, description: 'Total water consumption, withdrawal, and discharge by source.', version: '2024.1', sortOrder: 29 },
  { code: 'E3-5', standardCode: 'E3', name: 'Anticipated financial effects from material water and marine resources-related risks and opportunities', pillar: null, isMandatory: false, description: 'Financial effects of water-related risks.', version: '2024.1', sortOrder: 30 },

  // ═══════════════════════════════════════════════════════════════
  // E4 — Biodiversity and Ecosystems
  // ═══════════════════════════════════════════════════════════════
  { code: 'E4-1', standardCode: 'E4', name: 'Transition plan and consideration of biodiversity and ecosystems in strategy and business model', pillar: null, isMandatory: false, description: 'Biodiversity transition plan and strategy integration.', version: '2024.1', sortOrder: 31 },
  { code: 'E4-2', standardCode: 'E4', name: 'Policies related to biodiversity and ecosystems', pillar: null, isMandatory: false, description: 'Biodiversity protection policies.', version: '2024.1', sortOrder: 32 },
  { code: 'E4-3', standardCode: 'E4', name: 'Actions and resources related to biodiversity and ecosystems', pillar: null, isMandatory: false, description: 'Biodiversity conservation actions.', version: '2024.1', sortOrder: 33 },
  { code: 'E4-4', standardCode: 'E4', name: 'Targets related to biodiversity and ecosystems', pillar: null, isMandatory: false, description: 'Biodiversity targets and commitments.', version: '2024.1', sortOrder: 34 },
  { code: 'E4-5', standardCode: 'E4', name: 'Impact metrics related to biodiversity and ecosystems change', pillar: null, isMandatory: false, description: 'Land use change, species impact, ecosystem condition.', version: '2024.1', sortOrder: 35 },
  { code: 'E4-6', standardCode: 'E4', name: 'Anticipated financial effects from material biodiversity and ecosystem-related risks and opportunities', pillar: null, isMandatory: false, description: 'Financial effects of biodiversity risks.', version: '2024.1', sortOrder: 36 },

  // ═══════════════════════════════════════════════════════════════
  // E5 — Resource Use and Circular Economy
  // ═══════════════════════════════════════════════════════════════
  { code: 'E5-1', standardCode: 'E5', name: 'Policies related to resource use and circular economy', pillar: null, isMandatory: false, description: 'Circular economy and resource efficiency policies.', version: '2024.1', sortOrder: 37 },
  { code: 'E5-2', standardCode: 'E5', name: 'Actions and resources related to resource use and circular economy', pillar: null, isMandatory: false, description: 'Actions to improve resource efficiency and circularity.', version: '2024.1', sortOrder: 38 },
  { code: 'E5-3', standardCode: 'E5', name: 'Targets related to resource use and circular economy', pillar: null, isMandatory: false, description: 'Resource use and circularity targets.', version: '2024.1', sortOrder: 39 },
  { code: 'E5-4', standardCode: 'E5', name: 'Resource inflows', pillar: null, isMandatory: false, description: 'Materials used by weight/volume, recycled input, renewable materials.', version: '2024.1', sortOrder: 40 },
  { code: 'E5-5', standardCode: 'E5', name: 'Resource outflows', pillar: null, isMandatory: false, description: 'Waste generated by type and disposal method, hazardous waste.', version: '2024.1', sortOrder: 41 },
  { code: 'E5-6', standardCode: 'E5', name: 'Anticipated financial effects from material resource use and circular economy-related risks and opportunities', pillar: null, isMandatory: false, description: 'Financial effects of circular economy risks.', version: '2024.1', sortOrder: 42 },

  // ═══════════════════════════════════════════════════════════════
  // S1 — Own Workforce
  // ═══════════════════════════════════════════════════════════════
  { code: 'S1-1', standardCode: 'S1', name: 'Policies related to own workforce', pillar: null, isMandatory: false, description: 'Workforce-related policies including diversity, H&S, fair wages.', version: '2024.1', sortOrder: 43 },
  { code: 'S1-2', standardCode: 'S1', name: 'Processes for engaging with own workforce and workers\' representatives about impacts', pillar: null, isMandatory: false, description: 'Worker engagement and consultation processes.', version: '2024.1', sortOrder: 44 },
  { code: 'S1-3', standardCode: 'S1', name: 'Processes to remediate negative impacts and channels for own workforce to raise concerns', pillar: null, isMandatory: false, description: 'Grievance mechanisms and remediation processes.', version: '2024.1', sortOrder: 45 },
  { code: 'S1-4', standardCode: 'S1', name: 'Taking action on material impacts on own workforce, and approaches to managing material risks and pursuing material opportunities related to own workforce, and effectiveness of those actions', pillar: null, isMandatory: false, description: 'Actions and effectiveness of workforce impact management.', version: '2024.1', sortOrder: 46 },
  { code: 'S1-5', standardCode: 'S1', name: 'Targets related to managing material negative impacts, advancing positive impacts, and managing material risks and opportunities', pillar: null, isMandatory: false, description: 'Workforce-related targets.', version: '2024.1', sortOrder: 47 },
  { code: 'S1-6', standardCode: 'S1', name: 'Characteristics of the undertaking\'s employees', pillar: null, isMandatory: false, description: 'Headcount by gender, contract type, region.', version: '2024.1', sortOrder: 48 },
  { code: 'S1-7', standardCode: 'S1', name: 'Characteristics of non-employee workers in the undertaking\'s own workforce', pillar: null, isMandatory: false, description: 'Non-employee workers (contractors, agency) characteristics.', version: '2024.1', sortOrder: 49 },
  { code: 'S1-8', standardCode: 'S1', name: 'Collective bargaining coverage and social dialogue', pillar: null, isMandatory: false, description: 'Collective bargaining agreements coverage.', version: '2024.1', sortOrder: 50 },
  { code: 'S1-9', standardCode: 'S1', name: 'Diversity metrics', pillar: null, isMandatory: false, description: 'Gender diversity at top management and board, age distribution.', version: '2024.1', sortOrder: 51 },
  { code: 'S1-10', standardCode: 'S1', name: 'Adequate wages', pillar: null, isMandatory: false, description: 'Whether all employees receive adequate wages.', version: '2024.1', sortOrder: 52 },
  { code: 'S1-11', standardCode: 'S1', name: 'Social protection', pillar: null, isMandatory: false, description: 'Employees covered by social protection.', version: '2024.1', sortOrder: 53 },
  { code: 'S1-12', standardCode: 'S1', name: 'Persons with disabilities', pillar: null, isMandatory: false, description: 'Disability representation and accessibility.', version: '2024.1', sortOrder: 54 },
  { code: 'S1-13', standardCode: 'S1', name: 'Training and skills development metrics', pillar: null, isMandatory: false, description: 'Training hours and development programs.', version: '2024.1', sortOrder: 55 },
  { code: 'S1-14', standardCode: 'S1', name: 'Health and safety metrics', pillar: null, isMandatory: false, description: 'Work-related injuries, ill health, fatalities.', version: '2024.1', sortOrder: 56 },
  { code: 'S1-15', standardCode: 'S1', name: 'Work-life balance metrics', pillar: null, isMandatory: false, description: 'Family leave entitlement and uptake.', version: '2024.1', sortOrder: 57 },
  { code: 'S1-16', standardCode: 'S1', name: 'Remuneration metrics (pay gap and total remuneration)', pillar: null, isMandatory: false, description: 'Gender pay gap, CEO-to-median-worker pay ratio.', version: '2024.1', sortOrder: 58 },
  { code: 'S1-17', standardCode: 'S1', name: 'Incidents, complaints and severe human rights impacts', pillar: null, isMandatory: false, description: 'Work-related incidents, discrimination complaints.', version: '2024.1', sortOrder: 59 },

  // ═══════════════════════════════════════════════════════════════
  // S2 — Workers in the Value Chain
  // ═══════════════════════════════════════════════════════════════
  { code: 'S2-1', standardCode: 'S2', name: 'Policies related to value chain workers', pillar: null, isMandatory: false, description: 'Supply chain labour policies.', version: '2024.1', sortOrder: 60 },
  { code: 'S2-2', standardCode: 'S2', name: 'Processes for engaging with value chain workers about impacts', pillar: null, isMandatory: false, description: 'Value chain worker engagement processes.', version: '2024.1', sortOrder: 61 },
  { code: 'S2-3', standardCode: 'S2', name: 'Processes to remediate negative impacts and channels for value chain workers to raise concerns', pillar: null, isMandatory: false, description: 'Remediation for value chain workers.', version: '2024.1', sortOrder: 62 },
  { code: 'S2-4', standardCode: 'S2', name: 'Taking action on material impacts on value chain workers', pillar: null, isMandatory: false, description: 'Actions to address value chain worker impacts.', version: '2024.1', sortOrder: 63 },
  { code: 'S2-5', standardCode: 'S2', name: 'Targets related to managing material negative impacts, advancing positive impacts, and managing risks and opportunities', pillar: null, isMandatory: false, description: 'Value chain worker targets.', version: '2024.1', sortOrder: 64 },

  // ═══════════════════════════════════════════════════════════════
  // S3 — Affected Communities
  // ═══════════════════════════════════════════════════════════════
  { code: 'S3-1', standardCode: 'S3', name: 'Policies related to affected communities', pillar: null, isMandatory: false, description: 'Community engagement policies.', version: '2024.1', sortOrder: 65 },
  { code: 'S3-2', standardCode: 'S3', name: 'Processes for engaging with affected communities about impacts', pillar: null, isMandatory: false, description: 'Community engagement processes.', version: '2024.1', sortOrder: 66 },
  { code: 'S3-3', standardCode: 'S3', name: 'Processes to remediate negative impacts and channels for affected communities to raise concerns', pillar: null, isMandatory: false, description: 'Community grievance mechanisms.', version: '2024.1', sortOrder: 67 },
  { code: 'S3-4', standardCode: 'S3', name: 'Taking action on material impacts on affected communities', pillar: null, isMandatory: false, description: 'Actions to address community impacts.', version: '2024.1', sortOrder: 68 },
  { code: 'S3-5', standardCode: 'S3', name: 'Targets related to managing material negative impacts, advancing positive impacts, and managing risks and opportunities', pillar: null, isMandatory: false, description: 'Community-related targets.', version: '2024.1', sortOrder: 69 },

  // ═══════════════════════════════════════════════════════════════
  // S4 — Consumers and End-Users
  // ═══════════════════════════════════════════════════════════════
  { code: 'S4-1', standardCode: 'S4', name: 'Policies related to consumers and end-users', pillar: null, isMandatory: false, description: 'Consumer safety, privacy, and fair practice policies.', version: '2024.1', sortOrder: 70 },
  { code: 'S4-2', standardCode: 'S4', name: 'Processes for engaging with consumers and end-users about impacts', pillar: null, isMandatory: false, description: 'Consumer engagement processes.', version: '2024.1', sortOrder: 71 },
  { code: 'S4-3', standardCode: 'S4', name: 'Processes to remediate negative impacts and channels for consumers and end-users to raise concerns', pillar: null, isMandatory: false, description: 'Consumer complaint mechanisms.', version: '2024.1', sortOrder: 72 },
  { code: 'S4-4', standardCode: 'S4', name: 'Taking action on material impacts on consumers and end-users', pillar: null, isMandatory: false, description: 'Actions for consumer protection.', version: '2024.1', sortOrder: 73 },
  { code: 'S4-5', standardCode: 'S4', name: 'Targets related to managing material negative impacts, advancing positive impacts, and managing risks and opportunities', pillar: null, isMandatory: false, description: 'Consumer-related targets.', version: '2024.1', sortOrder: 74 },

  // ═══════════════════════════════════════════════════════════════
  // G1 — Business Conduct
  // ═══════════════════════════════════════════════════════════════
  { code: 'G1-1', standardCode: 'G1', name: 'Business conduct policies and corporate culture', pillar: null, isMandatory: false, description: 'Code of conduct, ethics policies, corporate culture.', version: '2024.1', sortOrder: 75 },
  { code: 'G1-2', standardCode: 'G1', name: 'Management of relationships with suppliers', pillar: null, isMandatory: false, description: 'Supplier management and payment practices.', version: '2024.1', sortOrder: 76 },
  { code: 'G1-3', standardCode: 'G1', name: 'Prevention and detection of corruption and bribery', pillar: null, isMandatory: false, description: 'Anti-corruption policies, training, and incidents.', version: '2024.1', sortOrder: 77 },
  { code: 'G1-4', standardCode: 'G1', name: 'Incidents of corruption or bribery', pillar: null, isMandatory: false, description: 'Confirmed corruption incidents and actions taken.', version: '2024.1', sortOrder: 78 },
  { code: 'G1-5', standardCode: 'G1', name: 'Political influence and lobbying activities', pillar: null, isMandatory: false, description: 'Political donations, lobbying spend, trade associations.', version: '2024.1', sortOrder: 79 },
  { code: 'G1-6', standardCode: 'G1', name: 'Payment practices', pillar: null, isMandatory: false, description: 'Payment terms, on-time payment rate, days payable outstanding.', version: '2024.1', sortOrder: 80 },
];
