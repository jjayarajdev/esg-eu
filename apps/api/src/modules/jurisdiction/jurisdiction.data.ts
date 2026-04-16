/**
 * Jurisdiction and framework configuration.
 * Defines supported regulatory regimes and their specific requirements.
 */

export interface Jurisdiction {
  code: string;
  name: string;
  region: string;
  primaryFramework: string;
  frameworks: string[];
  reportingWaves: ReportingWave[];
  materialityApproach: 'double' | 'single_financial';
  requiresXbrl: boolean;
  taxonomyRequired: boolean;
  description: string;
}

export interface ReportingWave {
  wave: number;
  name: string;
  description: string;
  firstReportingPeriod: string;
  thresholds: {
    revenue?: string;
    assets?: string;
    employees?: string;
    other?: string;
  };
}

export interface Framework {
  code: string;
  name: string;
  fullName: string;
  issuer: string;
  scope: 'climate' | 'sustainability' | 'financial';
  description: string;
}

export const FRAMEWORKS: Framework[] = [
  { code: 'ESRS', name: 'ESRS', fullName: 'European Sustainability Reporting Standards', issuer: 'EFRAG', scope: 'sustainability', description: 'Comprehensive E, S, G disclosure standards under EU CSRD. 12 standards, double materiality.' },
  { code: 'AASB_S2', name: 'AASB S2', fullName: 'Australian Sustainability Reporting Standard S2', issuer: 'AASB', scope: 'climate', description: 'Climate-related financial disclosures based on ISSB/IFRS S2, adapted for Australia.' },
  { code: 'AASB_S1', name: 'AASB S1', fullName: 'Australian Sustainability Reporting Standard S1', issuer: 'AASB', scope: 'sustainability', description: 'General sustainability disclosures (voluntary). Based on ISSB/IFRS S1.' },
  { code: 'ISSB_S1', name: 'IFRS S1', fullName: 'IFRS S1 General Requirements for Disclosure of Sustainability-related Financial Information', issuer: 'ISSB', scope: 'sustainability', description: 'Global baseline standard for sustainability disclosures.' },
  { code: 'ISSB_S2', name: 'IFRS S2', fullName: 'IFRS S2 Climate-related Disclosures', issuer: 'ISSB', scope: 'climate', description: 'Global baseline standard for climate-related financial disclosures. Successor to TCFD.' },
  { code: 'GRI', name: 'GRI', fullName: 'Global Reporting Initiative Standards', issuer: 'GRI', scope: 'sustainability', description: 'Stakeholder-oriented sustainability standards. Widely used globally, interoperable with ESRS.' },
  { code: 'TCFD', name: 'TCFD', fullName: 'Task Force on Climate-related Financial Disclosures', issuer: 'FSB', scope: 'climate', description: 'Climate risk and opportunity framework. Being superseded by ISSB S2.' },
];

export const JURISDICTIONS: Jurisdiction[] = [
  {
    code: 'EU',
    name: 'European Union',
    region: 'Europe',
    primaryFramework: 'ESRS',
    frameworks: ['ESRS', 'GRI', 'ISSB_S1', 'ISSB_S2', 'TCFD'],
    materialityApproach: 'double',
    requiresXbrl: true,
    taxonomyRequired: true,
    description: 'Corporate Sustainability Reporting Directive (CSRD) requires reporting under European Sustainability Reporting Standards (ESRS) with double materiality assessment.',
    reportingWaves: [
      { wave: 1, name: 'Wave 1 — Large PIEs', description: 'Large public-interest entities previously under NFRD (>500 employees)', firstReportingPeriod: 'FY2024', thresholds: { employees: '>500', other: 'Previously under NFRD' } },
      { wave: 2, name: 'Wave 2 — Large Companies', description: 'All large EU undertakings (>1,000 employees post-Omnibus)', firstReportingPeriod: 'FY2027', thresholds: { employees: '>1,000', revenue: '>EUR 50M', assets: '>EUR 25M' } },
      { wave: 3, name: 'Wave 3 — Listed SMEs', description: 'SMEs listed on EU-regulated markets', firstReportingPeriod: 'FY2028', thresholds: { other: 'Listed on EU-regulated market' } },
      { wave: 4, name: 'Wave 4 — Non-EU Companies', description: 'Non-EU companies with substantial EU activity', firstReportingPeriod: 'FY2028', thresholds: { revenue: '>EUR 450M EU turnover' } },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    region: 'Asia-Pacific',
    primaryFramework: 'AASB_S2',
    frameworks: ['AASB_S2', 'AASB_S1', 'ISSB_S1', 'ISSB_S2', 'GRI', 'TCFD'],
    materialityApproach: 'single_financial',
    requiresXbrl: false,
    taxonomyRequired: false,
    description: 'Mandatory climate-related financial disclosures under AASB S2, based on ISSB/IFRS S2. Phased rollout across three groups from January 2025.',
    reportingWaves: [
      { wave: 1, name: 'Group 1 — Large Entities', description: 'Large companies and NGER reporters', firstReportingPeriod: 'FY starting 1 Jan 2025', thresholds: { revenue: '>AUD 500M', assets: '>AUD 1B', employees: '>500' } },
      { wave: 2, name: 'Group 2 — Mid-size Entities', description: 'Mid-size companies meeting 2 of 3 thresholds', firstReportingPeriod: 'FY starting 1 Jul 2026', thresholds: { revenue: '>AUD 200M', assets: '>AUD 500M', employees: '>250' } },
      { wave: 3, name: 'Group 3 — Smaller Entities', description: 'Smaller reporting entities', firstReportingPeriod: 'FY starting 1 Jul 2027', thresholds: { revenue: '>AUD 50M', assets: '>AUD 25M', other: 'Meeting 2 of 3 criteria' } },
    ],
  },
  {
    code: 'GLOBAL',
    name: 'Global (ISSB)',
    region: 'International',
    primaryFramework: 'ISSB_S2',
    frameworks: ['ISSB_S1', 'ISSB_S2', 'GRI', 'TCFD'],
    materialityApproach: 'single_financial',
    requiresXbrl: false,
    taxonomyRequired: false,
    description: 'Voluntary reporting under ISSB/IFRS S1 and S2 standards. Global baseline for sustainability and climate disclosures adopted by 20+ jurisdictions.',
    reportingWaves: [
      { wave: 1, name: 'Early Adopters', description: 'Companies voluntarily adopting ISSB standards', firstReportingPeriod: 'FY2024+', thresholds: { other: 'Voluntary' } },
    ],
  },
];

export function getJurisdiction(code: string): Jurisdiction | undefined {
  return JURISDICTIONS.find((j) => j.code === code);
}

export function getFramework(code: string): Framework | undefined {
  return FRAMEWORKS.find((f) => f.code === code);
}
