import type { ESRSMetricDefinition } from '../types';

const V = '2024.1';
const EF = '2024-01-01';

/**
 * ESRS Metric Definitions — the ~167 data points that form the reporting universe.
 *
 * Each metric maps to a disclosure requirement within an ESRS standard.
 * Companies report only on metrics where the parent standard is material
 * (determined by the Double Materiality Assessment), except ESRS 2 which is always mandatory.
 *
 * Naming convention: {STANDARD}_{DISCLOSURE}_{METRIC_NAME}
 *   Example: E1_6_GHG_SCOPE1 = Standard E1, Disclosure E1-6, Scope 1 GHG emissions
 */
export const ESRS_METRIC_DEFINITIONS: ESRSMetricDefinition[] = [

  // ═══════════════════════════════════════════════════════════════
  // ESRS 2 — General Disclosures (mandatory for all)
  // ═══════════════════════════════════════════════════════════════

  // GOV pillar
  m('ESRS2_GOV1_BOARD_SUSTAINABILITY_OVERSIGHT', 'GOV-1', 'ESRS_2', 'Board sustainability oversight', 'Whether the board has oversight of sustainability matters', 'boolean', null, true, null, ['governance', 'board'], 'GRI 2-12', null, 1),
  m('ESRS2_GOV1_SUSTAINABILITY_COMMITTEE', 'GOV-1', 'ESRS_2', 'Dedicated sustainability committee', 'Whether a dedicated sustainability committee exists at board level', 'boolean', null, true, null, ['governance', 'board', 'committee'], null, null, 2),
  m('ESRS2_GOV3_SUSTAINABILITY_REMUNERATION', 'GOV-3', 'ESRS_2', 'Sustainability-linked remuneration', 'Whether executive remuneration is linked to sustainability targets', 'boolean', null, true, null, ['governance', 'remuneration'], 'GRI 2-19', null, 3),
  m('ESRS2_GOV3_SUSTAINABILITY_REMUNERATION_PCT', 'GOV-3', 'ESRS_2', 'Percentage of variable remuneration linked to sustainability', 'Share of variable remuneration linked to sustainability performance', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['governance', 'remuneration'], null, null, 4),

  // SBM pillar
  m('ESRS2_SBM1_REVENUE_BY_SECTOR', 'SBM-1', 'ESRS_2', 'Revenue by significant ESRS sector', 'Revenue breakdown by ESRS sector classification', 'text', null, false, null, ['strategy', 'revenue'], 'GRI 2-6', null, 5),
  m('ESRS2_SBM1_EMPLOYEE_COUNT', 'SBM-1', 'ESRS_2', 'Total number of employees (headcount)', 'Total headcount at reporting date', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['strategy', 'workforce', 'headcount'], 'GRI 2-7', 'IFRS S2', 6),
  m('ESRS2_SBM1_REVENUE_TOTAL', 'SBM-1', 'ESRS_2', 'Total net revenue', 'Total net revenue for the reporting period', 'numeric', 'EUR', true, { min: 0, precision: 0 }, ['strategy', 'revenue', 'financial'], null, null, 7),

  // ═══════════════════════════════════════════════════════════════
  // E1 — Climate Change
  // ═══════════════════════════════════════════════════════════════

  // E1-1 Transition plan
  m('E1_1_TRANSITION_PLAN', 'E1-1', 'E1', 'Climate transition plan', 'Description of the transition plan for climate change mitigation', 'text', null, false, null, ['climate', 'transition'], null, 'IFRS S2 para 14', 10),
  m('E1_1_TRANSITION_PLAN_ALIGNED', 'E1-1', 'E1', 'Transition plan aligned with 1.5°C', 'Whether the transition plan is aligned with 1.5°C Paris Agreement goal', 'boolean', null, true, null, ['climate', 'transition', 'paris'], null, null, 11),

  // E1-4 Targets
  m('E1_4_GHG_REDUCTION_TARGET_PCT', 'E1-4', 'E1', 'GHG emission reduction target (%)', 'Percentage GHG reduction target relative to base year', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['climate', 'target', 'ghg'], 'GRI 305', 'IFRS S2', 12),
  m('E1_4_GHG_TARGET_YEAR', 'E1-4', 'E1', 'GHG target year', 'Year by which the GHG reduction target is to be achieved', 'numeric', 'year', true, { min: 2024, max: 2100, precision: 0 }, ['climate', 'target'], null, null, 13),

  // E1-5 Energy
  m('E1_5_ENERGY_CONSUMPTION_TOTAL', 'E1-5', 'E1', 'Total energy consumption', 'Total energy consumption from all sources in MWh', 'numeric', 'MWh', true, { min: 0, precision: 2 }, ['climate', 'energy', 'mandatory'], 'GRI 302-1', 'IFRS S2', 14),
  m('E1_5_ENERGY_CONSUMPTION_RENEWABLE', 'E1-5', 'E1', 'Energy from renewable sources', 'Energy consumption from renewable sources in MWh', 'numeric', 'MWh', true, { min: 0, precision: 2 }, ['climate', 'energy', 'renewable'], 'GRI 302-1', null, 15),
  m('E1_5_ENERGY_CONSUMPTION_NONRENEWABLE', 'E1-5', 'E1', 'Energy from non-renewable sources', 'Energy consumption from non-renewable fossil fuel sources in MWh', 'numeric', 'MWh', true, { min: 0, precision: 2 }, ['climate', 'energy', 'fossil'], 'GRI 302-1', null, 16),
  m('E1_5_ENERGY_RENEWABLE_PCT', 'E1-5', 'E1', 'Share of renewable energy (%)', 'Percentage of total energy from renewable sources', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['climate', 'energy', 'renewable'], null, null, 17),
  m('E1_5_ENERGY_INTENSITY', 'E1-5', 'E1', 'Energy intensity per net revenue', 'Energy consumption per million EUR of net revenue', 'numeric', 'MWh/EUR M', true, { min: 0, precision: 2 }, ['climate', 'energy', 'intensity'], 'GRI 302-3', 'IFRS S2', 18),

  // E1-6 GHG Emissions
  m('E1_6_GHG_SCOPE1', 'E1-6', 'E1', 'Scope 1 GHG emissions', 'Total direct GHG emissions (Scope 1) in tCO2e', 'numeric', 'tCO2e', true, { min: 0, precision: 2 }, ['climate', 'ghg', 'scope1', 'mandatory'], 'GRI 305-1', 'IFRS S2', 19),
  m('E1_6_GHG_SCOPE2_LOCATION', 'E1-6', 'E1', 'Scope 2 GHG emissions (location-based)', 'Indirect GHG emissions from purchased energy, location-based', 'numeric', 'tCO2e', true, { min: 0, precision: 2 }, ['climate', 'ghg', 'scope2', 'mandatory'], 'GRI 305-2', 'IFRS S2', 20),
  m('E1_6_GHG_SCOPE2_MARKET', 'E1-6', 'E1', 'Scope 2 GHG emissions (market-based)', 'Indirect GHG emissions from purchased energy, market-based', 'numeric', 'tCO2e', true, { min: 0, precision: 2 }, ['climate', 'ghg', 'scope2', 'mandatory'], 'GRI 305-2', 'IFRS S2', 21),
  m('E1_6_GHG_SCOPE3_TOTAL', 'E1-6', 'E1', 'Total Scope 3 GHG emissions', 'Total value chain GHG emissions (all Scope 3 categories)', 'numeric', 'tCO2e', true, { min: 0, precision: 2 }, ['climate', 'ghg', 'scope3', 'mandatory'], 'GRI 305-3', 'IFRS S2', 22),
  m('E1_6_GHG_TOTAL', 'E1-6', 'E1', 'Total GHG emissions (Scope 1+2+3)', 'Sum of all scopes', 'numeric', 'tCO2e', true, { min: 0, precision: 2 }, ['climate', 'ghg', 'total'], 'GRI 305', 'IFRS S2', 23),
  m('E1_6_GHG_INTENSITY', 'E1-6', 'E1', 'GHG intensity per net revenue', 'Total GHG emissions per million EUR of net revenue', 'numeric', 'tCO2e/EUR M', true, { min: 0, precision: 4 }, ['climate', 'ghg', 'intensity'], 'GRI 305-4', 'IFRS S2', 24),

  // E1-9 Financial effects
  m('E1_9_PHYSICAL_RISK_ASSETS', 'E1-9', 'E1', 'Assets at material physical risk', 'Monetary value of assets exposed to material physical climate risks', 'numeric', 'EUR', true, { min: 0, precision: 0 }, ['climate', 'risk', 'physical', 'financial'], null, 'IFRS S2', 25),
  m('E1_9_TRANSITION_RISK_ASSETS', 'E1-9', 'E1', 'Assets at material transition risk', 'Monetary value of assets exposed to material transition risks', 'numeric', 'EUR', true, { min: 0, precision: 0 }, ['climate', 'risk', 'transition', 'financial'], null, 'IFRS S2', 26),

  // ═══════════════════════════════════════════════════════════════
  // E2 — Pollution
  // ═══════════════════════════════════════════════════════════════
  m('E2_4_AIR_POLLUTANTS', 'E2-4', 'E2', 'Air pollutant emissions', 'Total air pollutant emissions (NOx, SOx, PM, VOC)', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['pollution', 'air'], 'GRI 305-7', null, 30),
  m('E2_4_WATER_POLLUTANTS', 'E2-4', 'E2', 'Water pollutant discharges', 'Total pollutant load discharged to water bodies', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['pollution', 'water'], 'GRI 303-4', null, 31),
  m('E2_4_SOIL_POLLUTANTS', 'E2-4', 'E2', 'Soil pollutant releases', 'Total pollutant releases to soil', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['pollution', 'soil'], null, null, 32),
  m('E2_5_SUBSTANCES_OF_CONCERN', 'E2-5', 'E2', 'Substances of concern produced or used', 'Total volume of substances of concern produced or used', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['pollution', 'substances'], null, null, 33),
  m('E2_5_SVHC_SUBSTANCES', 'E2-5', 'E2', 'Substances of very high concern (SVHC)', 'Total volume of SVHC substances', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['pollution', 'svhc'], null, null, 34),

  // ═══════════════════════════════════════════════════════════════
  // E3 — Water and Marine Resources
  // ═══════════════════════════════════════════════════════════════
  m('E3_4_WATER_CONSUMPTION_TOTAL', 'E3-4', 'E3', 'Total water consumption', 'Total water consumption in megalitres', 'numeric', 'ML', true, { min: 0, precision: 2 }, ['water', 'consumption'], 'GRI 303-5', null, 40),
  m('E3_4_WATER_WITHDRAWAL_TOTAL', 'E3-4', 'E3', 'Total water withdrawal', 'Total water withdrawal from all sources', 'numeric', 'ML', true, { min: 0, precision: 2 }, ['water', 'withdrawal'], 'GRI 303-3', null, 41),
  m('E3_4_WATER_DISCHARGE_TOTAL', 'E3-4', 'E3', 'Total water discharge', 'Total water discharged to all destinations', 'numeric', 'ML', true, { min: 0, precision: 2 }, ['water', 'discharge'], 'GRI 303-4', null, 42),
  m('E3_4_WATER_STRESS_AREAS', 'E3-4', 'E3', 'Water consumed in water-stress areas', 'Water consumption in areas of high water stress', 'numeric', 'ML', true, { min: 0, precision: 2 }, ['water', 'stress'], null, null, 43),
  m('E3_4_WATER_INTENSITY', 'E3-4', 'E3', 'Water intensity per net revenue', 'Water consumption per million EUR of net revenue', 'numeric', 'ML/EUR M', true, { min: 0, precision: 4 }, ['water', 'intensity'], 'GRI 303-5', null, 44),
  m('E3_4_WATER_RECYCLED', 'E3-4', 'E3', 'Water recycled and reused', 'Total volume of water recycled and reused', 'numeric', 'ML', true, { min: 0, precision: 2 }, ['water', 'recycled'], 'GRI 303-3', null, 45),

  // ═══════════════════════════════════════════════════════════════
  // E4 — Biodiversity and Ecosystems
  // ═══════════════════════════════════════════════════════════════
  m('E4_5_LAND_USE_TOTAL', 'E4-5', 'E4', 'Total land use', 'Total area of land used for operations', 'numeric', 'hectares', true, { min: 0, precision: 2 }, ['biodiversity', 'land'], 'GRI 304-1', null, 50),
  m('E4_5_LAND_USE_PROTECTED', 'E4-5', 'E4', 'Operations in or near protected areas', 'Area of operations in or adjacent to protected areas or key biodiversity areas', 'numeric', 'hectares', true, { min: 0, precision: 2 }, ['biodiversity', 'protected'], 'GRI 304-1', null, 51),
  m('E4_5_LAND_USE_CHANGE', 'E4-5', 'E4', 'Land use change', 'Area converted from natural ecosystem to operational use during period', 'numeric', 'hectares', true, { min: 0, precision: 2 }, ['biodiversity', 'land_change'], null, null, 52),
  m('E4_5_SPECIES_AT_RISK', 'E4-5', 'E4', 'IUCN Red List species affected', 'Number of IUCN Red List species potentially affected by operations', 'numeric', 'count', true, { min: 0, precision: 0 }, ['biodiversity', 'species'], 'GRI 304-4', null, 53),

  // ═══════════════════════════════════════════════════════════════
  // E5 — Resource Use and Circular Economy
  // ═══════════════════════════════════════════════════════════════
  m('E5_4_MATERIALS_TOTAL', 'E5-4', 'E5', 'Total materials used', 'Total weight of materials used for production', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['circular', 'materials'], 'GRI 301-1', null, 60),
  m('E5_4_MATERIALS_RECYCLED_INPUT', 'E5-4', 'E5', 'Recycled input materials', 'Weight of recycled input materials used', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['circular', 'recycled'], 'GRI 301-2', null, 61),
  m('E5_4_MATERIALS_RENEWABLE', 'E5-4', 'E5', 'Renewable materials used', 'Weight of renewable materials (bio-based) used', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['circular', 'renewable'], null, null, 62),
  m('E5_4_RECYCLED_CONTENT_PCT', 'E5-4', 'E5', 'Recycled content percentage', 'Percentage of recycled content in products', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['circular', 'recycled'], null, null, 63),
  m('E5_5_WASTE_TOTAL', 'E5-5', 'E5', 'Total waste generated', 'Total weight of waste generated', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['circular', 'waste'], 'GRI 306-3', null, 64),
  m('E5_5_WASTE_HAZARDOUS', 'E5-5', 'E5', 'Hazardous waste generated', 'Total weight of hazardous waste', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['circular', 'waste', 'hazardous'], 'GRI 306-3', null, 65),
  m('E5_5_WASTE_NONHAZARDOUS', 'E5-5', 'E5', 'Non-hazardous waste generated', 'Total weight of non-hazardous waste', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['circular', 'waste'], 'GRI 306-3', null, 66),
  m('E5_5_WASTE_RECYCLED', 'E5-5', 'E5', 'Waste diverted from disposal (recycled)', 'Waste diverted from disposal through recycling', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['circular', 'waste', 'recycled'], 'GRI 306-4', null, 67),
  m('E5_5_WASTE_LANDFILL', 'E5-5', 'E5', 'Waste directed to landfill', 'Waste directed to disposal via landfill', 'numeric', 'tonnes', true, { min: 0, precision: 2 }, ['circular', 'waste', 'landfill'], 'GRI 306-5', null, 68),
  m('E5_5_WASTE_RECYCLING_RATE', 'E5-5', 'E5', 'Waste recycling rate (%)', 'Percentage of waste diverted from disposal', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['circular', 'waste', 'recycled'], null, null, 69),

  // ═══════════════════════════════════════════════════════════════
  // S1 — Own Workforce
  // ═══════════════════════════════════════════════════════════════
  m('S1_6_EMPLOYEES_TOTAL', 'S1-6', 'S1', 'Total employees (headcount)', 'Total number of employees at reporting date', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['workforce', 'headcount'], 'GRI 2-7', null, 80),
  m('S1_6_EMPLOYEES_FEMALE', 'S1-6', 'S1', 'Female employees', 'Number of female employees', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['workforce', 'gender', 'diversity'], 'GRI 405-1', null, 81),
  m('S1_6_EMPLOYEES_MALE', 'S1-6', 'S1', 'Male employees', 'Number of male employees', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['workforce', 'gender', 'diversity'], 'GRI 405-1', null, 82),
  m('S1_6_EMPLOYEES_PERMANENT', 'S1-6', 'S1', 'Permanent employees', 'Number of employees on permanent contracts', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['workforce', 'contract'], 'GRI 2-7', null, 83),
  m('S1_6_EMPLOYEES_TEMPORARY', 'S1-6', 'S1', 'Temporary employees', 'Number of employees on temporary contracts', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['workforce', 'contract'], 'GRI 2-7', null, 84),
  m('S1_6_EMPLOYEES_FULLTIME', 'S1-6', 'S1', 'Full-time employees', 'Number of full-time employees', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['workforce', 'worktime'], 'GRI 2-7', null, 85),
  m('S1_6_EMPLOYEES_PARTTIME', 'S1-6', 'S1', 'Part-time employees', 'Number of part-time employees', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['workforce', 'worktime'], 'GRI 2-7', null, 86),

  m('S1_7_NONEMPLOYEE_WORKERS', 'S1-7', 'S1', 'Non-employee workers', 'Number of non-employee workers (contractors, agency workers)', 'numeric', 'headcount', true, { min: 0, precision: 0 }, ['workforce', 'contractors'], 'GRI 2-8', null, 87),

  m('S1_8_COLLECTIVE_BARGAINING_PCT', 'S1-8', 'S1', 'Collective bargaining coverage (%)', 'Percentage of employees covered by collective bargaining agreements', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'bargaining'], 'GRI 2-30', null, 88),

  // S1-9 Diversity
  m('S1_9_WOMEN_MANAGEMENT_PCT', 'S1-9', 'S1', 'Women in top management (%)', 'Percentage of women in top management positions', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'diversity', 'gender'], 'GRI 405-1', null, 89),
  m('S1_9_WOMEN_BOARD_PCT', 'S1-9', 'S1', 'Women on board (%)', 'Percentage of women on the board of directors', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'diversity', 'gender', 'board'], 'GRI 405-1', null, 90),
  m('S1_9_AGE_UNDER30_PCT', 'S1-9', 'S1', 'Employees under 30 (%)', 'Percentage of employees aged under 30', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'diversity', 'age'], 'GRI 405-1', null, 91),
  m('S1_9_AGE_30TO50_PCT', 'S1-9', 'S1', 'Employees aged 30-50 (%)', 'Percentage of employees aged 30 to 50', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'diversity', 'age'], 'GRI 405-1', null, 92),
  m('S1_9_AGE_OVER50_PCT', 'S1-9', 'S1', 'Employees over 50 (%)', 'Percentage of employees aged over 50', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'diversity', 'age'], 'GRI 405-1', null, 93),

  m('S1_10_ADEQUATE_WAGES', 'S1-10', 'S1', 'All employees receive adequate wages', 'Whether all employees receive at least adequate wages', 'boolean', null, true, null, ['workforce', 'wages'], null, null, 94),

  m('S1_12_DISABILITY_PCT', 'S1-12', 'S1', 'Persons with disabilities (%)', 'Percentage of employees with disabilities', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'diversity', 'disability'], null, null, 95),

  // S1-13 Training
  m('S1_13_TRAINING_HOURS_TOTAL', 'S1-13', 'S1', 'Total training hours', 'Total hours of training provided to employees', 'numeric', 'hours', true, { min: 0, precision: 0 }, ['workforce', 'training'], 'GRI 404-1', null, 96),
  m('S1_13_TRAINING_HOURS_PER_EMPLOYEE', 'S1-13', 'S1', 'Training hours per employee', 'Average training hours per employee', 'numeric', 'hours/employee', true, { min: 0, precision: 1 }, ['workforce', 'training'], 'GRI 404-1', null, 97),

  // S1-14 Health and Safety
  m('S1_14_FATALITIES', 'S1-14', 'S1', 'Work-related fatalities', 'Number of work-related fatalities', 'numeric', 'count', true, { min: 0, precision: 0 }, ['workforce', 'safety', 'fatalities'], 'GRI 403-9', null, 98),
  m('S1_14_RECORDABLE_INCIDENTS', 'S1-14', 'S1', 'Recordable work-related injuries', 'Number of recordable work-related injuries', 'numeric', 'count', true, { min: 0, precision: 0 }, ['workforce', 'safety', 'injuries'], 'GRI 403-9', null, 99),
  m('S1_14_TRIR', 'S1-14', 'S1', 'Total recordable incident rate (TRIR)', 'Number of recordable incidents per 200,000 hours worked', 'numeric', 'rate', true, { min: 0, precision: 2 }, ['workforce', 'safety', 'trir'], 'GRI 403-9', null, 100),
  m('S1_14_LOST_TIME_INJURY_RATE', 'S1-14', 'S1', 'Lost time injury frequency rate (LTIFR)', 'Lost time injuries per million hours worked', 'numeric', 'rate', true, { min: 0, precision: 2 }, ['workforce', 'safety', 'ltifr'], 'GRI 403-9', null, 101),
  m('S1_14_DAYS_LOST', 'S1-14', 'S1', 'Days lost to work-related injuries', 'Total days lost due to work-related injuries and ill health', 'numeric', 'days', true, { min: 0, precision: 0 }, ['workforce', 'safety'], 'GRI 403-9', null, 102),
  m('S1_14_OCCUPATIONAL_DISEASE', 'S1-14', 'S1', 'Cases of work-related ill health', 'Number of recordable cases of work-related ill health', 'numeric', 'count', true, { min: 0, precision: 0 }, ['workforce', 'safety', 'health'], 'GRI 403-10', null, 103),

  // S1-15 Work-life balance
  m('S1_15_FAMILY_LEAVE_ENTITLED_PCT', 'S1-15', 'S1', 'Employees entitled to family leave (%)', 'Percentage of employees entitled to family-related leave', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'balance'], null, null, 104),

  // S1-16 Remuneration
  m('S1_16_GENDER_PAY_GAP', 'S1-16', 'S1', 'Gender pay gap (%)', 'Difference in average pay between men and women as percentage of male pay', 'percentage', '%', true, { min: -100, max: 100, precision: 1 }, ['workforce', 'pay', 'gender'], 'GRI 405-2', null, 105),
  m('S1_16_CEO_PAY_RATIO', 'S1-16', 'S1', 'CEO-to-median-worker pay ratio', 'Ratio of annual total compensation of CEO to median employee', 'numeric', 'ratio', true, { min: 0, precision: 1 }, ['workforce', 'pay', 'ratio'], null, null, 106),

  // S1-17 Incidents
  m('S1_17_DISCRIMINATION_INCIDENTS', 'S1-17', 'S1', 'Discrimination incidents', 'Number of incidents of discrimination reported', 'numeric', 'count', true, { min: 0, precision: 0 }, ['workforce', 'discrimination'], 'GRI 406-1', null, 107),
  m('S1_17_HUMAN_RIGHTS_COMPLAINTS', 'S1-17', 'S1', 'Human rights complaints filed', 'Number of complaints related to human rights filed through internal channels', 'numeric', 'count', true, { min: 0, precision: 0 }, ['workforce', 'human_rights'], null, null, 108),

  // Turnover (additional key workforce metric)
  m('S1_6_VOLUNTARY_TURNOVER_RATE', 'S1-6', 'S1', 'Voluntary turnover rate (%)', 'Percentage of employees who left voluntarily during the period', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'turnover'], 'GRI 401-1', null, 109),
  m('S1_6_INVOLUNTARY_TURNOVER_RATE', 'S1-6', 'S1', 'Involuntary turnover rate (%)', 'Percentage of employees terminated during the period', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['workforce', 'turnover'], 'GRI 401-1', null, 110),

  // ═══════════════════════════════════════════════════════════════
  // S2 — Workers in the Value Chain
  // ═══════════════════════════════════════════════════════════════
  m('S2_1_VALUE_CHAIN_POLICY', 'S2-1', 'S2', 'Value chain worker policies', 'Description of policies regarding workers in the value chain', 'text', null, false, null, ['value_chain', 'policy'], 'GRI 414-1', null, 120),
  m('S2_4_SUPPLIERS_ASSESSED', 'S2-4', 'S2', 'Suppliers assessed for social impacts', 'Number of suppliers assessed for labour practices and human rights', 'numeric', 'count', true, { min: 0, precision: 0 }, ['value_chain', 'assessment'], 'GRI 414-1', null, 121),
  m('S2_4_SUPPLIERS_ASSESSED_PCT', 'S2-4', 'S2', 'Suppliers assessed (%)', 'Percentage of suppliers assessed for social impacts', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['value_chain', 'assessment'], 'GRI 414-1', null, 122),
  m('S2_4_FORCED_LABOUR_INCIDENTS', 'S2-4', 'S2', 'Forced labour incidents identified', 'Number of forced labour incidents identified in value chain', 'numeric', 'count', true, { min: 0, precision: 0 }, ['value_chain', 'forced_labour'], null, null, 123),
  m('S2_4_CHILD_LABOUR_INCIDENTS', 'S2-4', 'S2', 'Child labour incidents identified', 'Number of child labour incidents identified in value chain', 'numeric', 'count', true, { min: 0, precision: 0 }, ['value_chain', 'child_labour'], null, null, 124),

  // ═══════════════════════════════════════════════════════════════
  // S3 — Affected Communities
  // ═══════════════════════════════════════════════════════════════
  m('S3_1_COMMUNITY_POLICY', 'S3-1', 'S3', 'Community engagement policies', 'Description of policies for community engagement and impact management', 'text', null, false, null, ['community', 'policy'], null, null, 130),
  m('S3_4_COMMUNITY_GRIEVANCES', 'S3-4', 'S3', 'Community grievances filed', 'Number of grievances filed by community members', 'numeric', 'count', true, { min: 0, precision: 0 }, ['community', 'grievance'], null, null, 131),

  // ═══════════════════════════════════════════════════════════════
  // S4 — Consumers and End-Users
  // ═══════════════════════════════════════════════════════════════
  m('S4_1_CONSUMER_POLICY', 'S4-1', 'S4', 'Consumer safety and privacy policies', 'Description of consumer protection, safety, and privacy policies', 'text', null, false, null, ['consumer', 'policy'], null, null, 140),
  m('S4_4_PRODUCT_SAFETY_INCIDENTS', 'S4-4', 'S4', 'Product safety incidents', 'Number of product safety incidents reported', 'numeric', 'count', true, { min: 0, precision: 0 }, ['consumer', 'safety'], 'GRI 416-2', null, 141),
  m('S4_4_DATA_PRIVACY_BREACHES', 'S4-4', 'S4', 'Data privacy breaches', 'Number of substantiated complaints regarding data privacy breaches', 'numeric', 'count', true, { min: 0, precision: 0 }, ['consumer', 'privacy'], 'GRI 418-1', null, 142),
  m('S4_4_CUSTOMER_COMPLAINTS', 'S4-4', 'S4', 'Customer complaints received', 'Total number of customer complaints received during the period', 'numeric', 'count', true, { min: 0, precision: 0 }, ['consumer', 'complaints'], null, null, 143),

  // ═══════════════════════════════════════════════════════════════
  // G1 — Business Conduct
  // ═══════════════════════════════════════════════════════════════
  m('G1_1_CODE_OF_CONDUCT', 'G1-1', 'G1', 'Code of conduct coverage', 'Description of the code of conduct and corporate culture policies', 'text', null, false, null, ['governance', 'ethics'], 'GRI 2-23', null, 150),
  m('G1_1_CODE_TRAINING_PCT', 'G1-1', 'G1', 'Code of conduct training (%)', 'Percentage of employees trained on code of conduct', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['governance', 'ethics', 'training'], null, null, 151),

  m('G1_3_ANTICORRUPTION_TRAINING_PCT', 'G1-3', 'G1', 'Anti-corruption training (%)', 'Percentage of employees who received anti-corruption training', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['governance', 'corruption', 'training'], 'GRI 205-2', null, 152),
  m('G1_4_CORRUPTION_INCIDENTS', 'G1-4', 'G1', 'Confirmed corruption incidents', 'Number of confirmed incidents of corruption', 'numeric', 'count', true, { min: 0, precision: 0 }, ['governance', 'corruption', 'incidents'], 'GRI 205-3', null, 153),
  m('G1_4_CORRUPTION_LEGAL_ACTIONS', 'G1-4', 'G1', 'Legal actions for corruption', 'Number of legal actions pending or completed regarding corruption', 'numeric', 'count', true, { min: 0, precision: 0 }, ['governance', 'corruption', 'legal'], 'GRI 205-3', null, 154),

  m('G1_5_POLITICAL_DONATIONS', 'G1-5', 'G1', 'Political donations', 'Total monetary value of political contributions', 'numeric', 'EUR', true, { min: 0, precision: 0 }, ['governance', 'political'], 'GRI 415-1', null, 155),
  m('G1_5_LOBBYING_SPEND', 'G1-5', 'G1', 'Lobbying expenditures', 'Total expenditure on lobbying activities', 'numeric', 'EUR', true, { min: 0, precision: 0 }, ['governance', 'lobbying'], null, null, 156),

  m('G1_6_PAYMENT_TERMS_DAYS', 'G1-6', 'G1', 'Average payment terms (days)', 'Average payment terms offered to suppliers in days', 'numeric', 'days', true, { min: 0, precision: 0 }, ['governance', 'payment'], null, null, 157),
  m('G1_6_ONTIME_PAYMENT_PCT', 'G1-6', 'G1', 'On-time payment rate (%)', 'Percentage of invoices paid within agreed payment terms', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['governance', 'payment'], null, null, 158),
  m('G1_6_DPO', 'G1-6', 'G1', 'Days payable outstanding (DPO)', 'Average number of days to pay supplier invoices', 'numeric', 'days', true, { min: 0, precision: 0 }, ['governance', 'payment', 'dpo'], null, null, 159),

  // Whistleblower metrics
  m('G1_1_WHISTLEBLOWER_REPORTS', 'G1-1', 'G1', 'Whistleblower reports received', 'Number of whistleblower reports received through internal channels', 'numeric', 'count', true, { min: 0, precision: 0 }, ['governance', 'whistleblower'], null, null, 160),
  m('G1_1_WHISTLEBLOWER_RESOLVED', 'G1-1', 'G1', 'Whistleblower reports resolved', 'Number of whistleblower reports resolved during the period', 'numeric', 'count', true, { min: 0, precision: 0 }, ['governance', 'whistleblower'], null, null, 161),

  // ═══════════════════════════════════════════════════════════════
  // EU Taxonomy Alignment (reported under ESRS 2 / E1)
  // ═══════════════════════════════════════════════════════════════
  m('TAX_TURNOVER_ALIGNED_PCT', 'SBM-1', 'ESRS_2', 'Taxonomy-aligned turnover (%)', 'Share of turnover from taxonomy-aligned economic activities', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['taxonomy', 'turnover'], null, null, 170),
  m('TAX_CAPEX_ALIGNED_PCT', 'SBM-1', 'ESRS_2', 'Taxonomy-aligned CapEx (%)', 'Share of capital expenditure in taxonomy-aligned activities', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['taxonomy', 'capex'], null, null, 171),
  m('TAX_OPEX_ALIGNED_PCT', 'SBM-1', 'ESRS_2', 'Taxonomy-aligned OpEx (%)', 'Share of operating expenditure in taxonomy-aligned activities', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['taxonomy', 'opex'], null, null, 172),
  m('TAX_TURNOVER_ELIGIBLE_PCT', 'SBM-1', 'ESRS_2', 'Taxonomy-eligible turnover (%)', 'Share of turnover from taxonomy-eligible economic activities', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['taxonomy', 'turnover', 'eligible'], null, null, 173),
  m('TAX_CAPEX_ELIGIBLE_PCT', 'SBM-1', 'ESRS_2', 'Taxonomy-eligible CapEx (%)', 'Share of capital expenditure in taxonomy-eligible activities', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['taxonomy', 'capex', 'eligible'], null, null, 174),
  m('TAX_OPEX_ELIGIBLE_PCT', 'SBM-1', 'ESRS_2', 'Taxonomy-eligible OpEx (%)', 'Share of operating expenditure in taxonomy-eligible activities', 'percentage', '%', true, { min: 0, max: 100, precision: 1 }, ['taxonomy', 'opex', 'eligible'], null, null, 175),
];

/**
 * Helper to create a metric definition with defaults.
 */
function m(
  code: string,
  disclosureReqCode: string,
  standardCode: string,
  name: string,
  description: string,
  dataType: ESRSMetricDefinition['dataType'],
  unit: string | null,
  isQuantitative: boolean,
  validationRules: ESRSMetricDefinition['validationRules'],
  tags: string[],
  griMapping: string | null,
  issbMapping: string | null,
  sortOrder: number,
): ESRSMetricDefinition {
  return {
    code,
    disclosureReqCode,
    standardCode,
    name,
    description,
    dataType,
    unit,
    isQuantitative,
    reportingFrequency: 'annual',
    aggregationMethod: isQuantitative ? (dataType === 'percentage' ? 'latest' : 'sum') : null,
    validationRules: validationRules ?? (isQuantitative ? { required: true } : null),
    enumValues: null,
    tags,
    griMapping,
    issbMapping,
    xbrlTag: null, // XBRL tags will be populated from the ESEF taxonomy
    version: V,
    effectiveFrom: EF,
    sortOrder,
  };
}
