/**
 * Shows framework cross-mapping badges for a metric.
 * Displays which other frameworks (GRI, ISSB, TCFD) map to this ESRS metric.
 */

// Mapping from ESRS metric codes to other frameworks (subset for display)
const FRAMEWORK_MAP: Record<string, { gri?: string; issb?: string }> = {
  E1_6_GHG_SCOPE1: { gri: 'GRI 305-1', issb: 'IFRS S2' },
  E1_6_GHG_SCOPE2_LOCATION: { gri: 'GRI 305-2', issb: 'IFRS S2' },
  E1_6_GHG_SCOPE2_MARKET: { gri: 'GRI 305-2', issb: 'IFRS S2' },
  E1_6_GHG_SCOPE3_TOTAL: { gri: 'GRI 305-3', issb: 'IFRS S2' },
  E1_6_GHG_TOTAL: { gri: 'GRI 305', issb: 'IFRS S2' },
  E1_5_ENERGY_CONSUMPTION_TOTAL: { gri: 'GRI 302-1', issb: 'IFRS S2' },
  E1_5_ENERGY_CONSUMPTION_RENEWABLE: { gri: 'GRI 302-1' },
  E1_5_ENERGY_INTENSITY: { gri: 'GRI 302-3', issb: 'IFRS S2' },
  E2_4_AIR_POLLUTANTS: { gri: 'GRI 305-7' },
  E3_4_WATER_CONSUMPTION_TOTAL: { gri: 'GRI 303-5' },
  E3_4_WATER_WITHDRAWAL_TOTAL: { gri: 'GRI 303-3' },
  E5_5_WASTE_TOTAL: { gri: 'GRI 306-3' },
  E5_5_WASTE_HAZARDOUS: { gri: 'GRI 306-3' },
  E5_4_MATERIALS_TOTAL: { gri: 'GRI 301-1' },
  E5_4_MATERIALS_RECYCLED_INPUT: { gri: 'GRI 301-2' },
  S1_6_EMPLOYEES_TOTAL: { gri: 'GRI 2-7' },
  S1_6_EMPLOYEES_FEMALE: { gri: 'GRI 405-1' },
  S1_9_WOMEN_MANAGEMENT_PCT: { gri: 'GRI 405-1' },
  S1_16_GENDER_PAY_GAP: { gri: 'GRI 405-2' },
  S1_14_FATALITIES: { gri: 'GRI 403-9' },
  S1_14_TRIR: { gri: 'GRI 403-9' },
  S1_13_TRAINING_HOURS_PER_EMPLOYEE: { gri: 'GRI 404-1' },
  S1_8_COLLECTIVE_BARGAINING_PCT: { gri: 'GRI 2-30' },
  S2_4_SUPPLIERS_ASSESSED: { gri: 'GRI 414-1' },
  G1_4_CORRUPTION_INCIDENTS: { gri: 'GRI 205-3' },
  G1_3_ANTICORRUPTION_TRAINING_PCT: { gri: 'GRI 205-2' },
  G1_5_POLITICAL_DONATIONS: { gri: 'GRI 415-1' },
  S4_4_PRODUCT_SAFETY_INCIDENTS: { gri: 'GRI 416-2' },
  S4_4_DATA_PRIVACY_BREACHES: { gri: 'GRI 418-1' },
};

export function FrameworkBadges({ metricCode }: { metricCode: string }) {
  const mapping = FRAMEWORK_MAP[metricCode];
  if (!mapping) return null;

  return (
    <span className="inline-flex gap-1 ml-1">
      {mapping.gri && (
        <span className="px-1 py-0 text-[9px] bg-violet-100 text-violet-600 rounded font-mono" title={`Maps to ${mapping.gri}`}>
          {mapping.gri}
        </span>
      )}
      {mapping.issb && (
        <span className="px-1 py-0 text-[9px] bg-cyan-100 text-cyan-600 rounded font-mono" title={`Maps to ${mapping.issb}`}>
          {mapping.issb}
        </span>
      )}
    </span>
  );
}
