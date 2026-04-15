import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../lib/api-client';
import { useAuth } from '../../../providers/AuthProvider';

interface ConnectorConfig {
  connectorType: string;
  displayName: string;
  mode: 'mock' | 'live';
  endpoint: string;
  authType: string;
  apiKey: string;
  webhookUrl: string;
  lastSync: string | null;
  recordsLastSync: number;
}

// Realistic connector metadata — API docs embedded in the platform
const CONNECTOR_META: Record<string, {
  displayName: string;
  vendor: string;
  apiFormat: string;
  authTypes: string[];
  docsUrl: string;
  defaultEndpoint: string;
  description: string;
  domain: string;
  esrsCoverage: string[];
  sampleRequest: string;
  sampleResponse: string;
  fieldMappings: Array<{ sourceField: string; esrsMetric: string; esrsName: string; transform?: string }>;
}> = {
  mock_enablon: {
    displayName: 'Enablon (Wolters Kluwer)',
    vendor: 'Wolters Kluwer',
    apiFormat: 'REST API v1',
    authTypes: ['API Key', 'OAuth 2.0'],
    docsUrl: 'https://docs.enablon.com/api/v1',
    defaultEndpoint: 'https://api.enablon.com/api/v1/indicators/export',
    description: 'EHS & Sustainability platform. Provides environmental performance data including GHG emissions, energy, water, waste, and pollution metrics.',
    domain: 'HSE&S / Environmental',
    esrsCoverage: ['E1', 'E2', 'E3', 'E5'],
    sampleRequest: `GET /api/v1/indicators/export
Host: api.enablon.com
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "reportingYear": 2024,
  "consolidationLevel": "corporate",
  "indicators": [
    "ghg_scope1", "ghg_scope2_location",
    "ghg_scope2_market", "ghg_scope3",
    "energy_total", "energy_renewable",
    "water_consumption", "waste_total"
  ]
}`,
    sampleResponse: `{
  "exportMetadata": {
    "systemId": "ENABLON-EU-PROD",
    "exportDate": "2025-02-15T08:30:00Z",
    "consolidationLevel": "corporate",
    "reportingYear": 2024
  },
  "emissions": {
    "ghgScope1": {
      "total_tCO2e": 12500,
      "bySite": [
        {
          "siteId": "NL-AMS-01",
          "siteName": "Amsterdam Plant",
          "country": "NL",
          "value": 4200
        },
        {
          "siteId": "DE-HAM-01",
          "siteName": "Hamburg Factory",
          "country": "DE",
          "value": 3800
        }
      ],
      "methodology": "GHG Protocol Corporate Standard",
      "verificationStatus": "verified"
    },
    "ghgScope2": {
      "locationBased_tCO2e": 45000,
      "marketBased_tCO2e": 38000,
      "gridFactorSource": "IEA 2024 Emission Factors"
    }
  },
  "energy": {
    "totalConsumption_MWh": 850000,
    "renewable_MWh": 340000,
    "renewablePercentage": 40,
    "bySource": [
      { "sourceType": "Natural Gas", "value_MWh": 320000 },
      { "sourceType": "Solar PV", "value_MWh": 85000 },
      { "sourceType": "Wind (PPAs)", "value_MWh": 155000 }
    ]
  }
}`,
    fieldMappings: [
      { sourceField: 'emissions.ghgScope1.total_tCO2e', esrsMetric: 'E1_6_GHG_SCOPE1', esrsName: 'Scope 1 GHG emissions' },
      { sourceField: 'emissions.ghgScope2.locationBased_tCO2e', esrsMetric: 'E1_6_GHG_SCOPE2_LOCATION', esrsName: 'Scope 2 GHG (location)' },
      { sourceField: 'emissions.ghgScope2.marketBased_tCO2e', esrsMetric: 'E1_6_GHG_SCOPE2_MARKET', esrsName: 'Scope 2 GHG (market)' },
      { sourceField: 'emissions.ghgScope3.total_tCO2e', esrsMetric: 'E1_6_GHG_SCOPE3_TOTAL', esrsName: 'Scope 3 GHG total' },
      { sourceField: 'emissions.totalGhg_tCO2e', esrsMetric: 'E1_6_GHG_TOTAL', esrsName: 'Total GHG emissions' },
      { sourceField: 'energy.totalConsumption_MWh', esrsMetric: 'E1_5_ENERGY_CONSUMPTION_TOTAL', esrsName: 'Total energy consumption' },
      { sourceField: 'energy.renewable_MWh', esrsMetric: 'E1_5_ENERGY_CONSUMPTION_RENEWABLE', esrsName: 'Renewable energy' },
      { sourceField: 'energy.renewablePercentage', esrsMetric: 'E1_5_ENERGY_RENEWABLE_PCT', esrsName: 'Renewable energy %', transform: 'direct' },
      { sourceField: 'pollution.airEmissions.total_tonnes', esrsMetric: 'E2_4_AIR_POLLUTANTS', esrsName: 'Air pollutant emissions' },
      { sourceField: 'pollution.waterDischarges.total_tonnes', esrsMetric: 'E2_4_WATER_POLLUTANTS', esrsName: 'Water pollutants' },
      { sourceField: 'water.totalConsumption_ML', esrsMetric: 'E3_4_WATER_CONSUMPTION_TOTAL', esrsName: 'Water consumption' },
      { sourceField: 'water.totalWithdrawal_ML', esrsMetric: 'E3_4_WATER_WITHDRAWAL_TOTAL', esrsName: 'Water withdrawal' },
      { sourceField: 'waste.totalGenerated_tonnes', esrsMetric: 'E5_5_WASTE_TOTAL', esrsName: 'Total waste' },
      { sourceField: 'waste.hazardous_tonnes', esrsMetric: 'E5_5_WASTE_HAZARDOUS', esrsName: 'Hazardous waste' },
      { sourceField: 'waste.recyclingRate', esrsMetric: 'E5_5_WASTE_RECYCLING_RATE', esrsName: 'Recycling rate %' },
    ],
  },
  mock_successfactors: {
    displayName: 'SAP SuccessFactors',
    vendor: 'SAP SE',
    apiFormat: 'OData v2',
    authTypes: ['OAuth 2.0 (SAML Bearer)', 'API Key'],
    docsUrl: 'https://api.sap.com/api/PLTPerformance/overview',
    defaultEndpoint: 'https://api.successfactors.eu/odata/v2/WorkforceAnalytics',
    description: 'Human Capital Management platform. Provides workforce demographics, diversity metrics, health & safety, training, compensation, and turnover data.',
    domain: 'HR / Workforce',
    esrsCoverage: ['S1'],
    sampleRequest: `GET /odata/v2/WorkforceAnalytics('2024')
Host: api.successfactors.eu
Authorization: Bearer {oauth_token}
Accept: application/json

$select=snapshot
$expand=snapshot/headcount,snapshot/diversity,
        snapshot/healthAndSafety,snapshot/compensation`,
    sampleResponse: `{
  "d": {
    "__metadata": {
      "uri": "WorkforceAnalytics('2024')",
      "type": "SFOData.WorkforceAnalyticsResult"
    },
    "reportingPeriod": "2024",
    "organizationId": "ACME_EU",
    "snapshot": {
      "headcount": {
        "total": 34500,
        "byGender": {
          "male": 22080, "female": 12420
        },
        "byContractType": {
          "permanent": 31050, "temporary": 3450
        },
        "byRegion": [
          { "regionCode": "EU-WEST", "count": 18400 },
          { "regionCode": "APAC", "count": 6900 }
        ]
      },
      "compensation": {
        "genderPayGap": 4.2,
        "collectiveBargainingCoverage": 65
      },
      "healthAndSafety": {
        "fatalities": 0,
        "totalRecordableIncidentRate": 0.42
      }
    }
  }
}`,
    fieldMappings: [
      { sourceField: 'd.snapshot.headcount.total', esrsMetric: 'S1_6_EMPLOYEES_TOTAL', esrsName: 'Total employees' },
      { sourceField: 'd.snapshot.headcount.byGender.female', esrsMetric: 'S1_6_EMPLOYEES_FEMALE', esrsName: 'Female employees' },
      { sourceField: 'd.snapshot.headcount.byGender.male', esrsMetric: 'S1_6_EMPLOYEES_MALE', esrsName: 'Male employees' },
      { sourceField: 'd.snapshot.compensation.genderPayGap', esrsMetric: 'S1_16_GENDER_PAY_GAP', esrsName: 'Gender pay gap %' },
      { sourceField: 'd.snapshot.compensation.collectiveBargainingCoverage', esrsMetric: 'S1_8_COLLECTIVE_BARGAINING_PCT', esrsName: 'Collective bargaining %' },
      { sourceField: 'd.snapshot.healthAndSafety.fatalities', esrsMetric: 'S1_14_FATALITIES', esrsName: 'Work-related fatalities' },
      { sourceField: 'd.snapshot.healthAndSafety.totalRecordableIncidentRate', esrsMetric: 'S1_14_TRIR', esrsName: 'TRIR' },
    ],
  },
  mock_sap_s4hana: {
    displayName: 'SAP S/4HANA',
    vendor: 'SAP SE',
    apiFormat: 'OData v4',
    authTypes: ['OAuth 2.0', 'X.509 Certificate'],
    docsUrl: 'https://api.sap.com/api/SUSTAINABILITY',
    defaultEndpoint: 'https://my-s4hana.s4hana.cloud.sap/sap/opu/odata4/sap/sustainability/v1',
    description: 'Enterprise ERP. Provides financial data, EU Taxonomy alignment KPIs, energy costs, and climate risk exposure from the Sustainability Control Tower.',
    domain: 'ERP / Financial',
    esrsCoverage: ['ESRS_2', 'E1'],
    sampleRequest: `GET /sap/opu/odata4/sap/sustainability/v1/FinancialStatement('2024')
Host: my-s4hana.s4hana.cloud.sap
Authorization: Bearer {oauth_token}
Accept: application/json`,
    sampleResponse: `{
  "d": {
    "companyCode": "1000",
    "fiscalYear": "2024",
    "financials": {
      "netRevenue": 10800000000,
      "capitalExpenditures": 890000000
    },
    "taxonomyAlignment": {
      "turnover": { "eligible_pct": 62, "aligned_pct": 38 },
      "capex": { "eligible_pct": 71, "aligned_pct": 45 },
      "opex": { "eligible_pct": 55, "aligned_pct": 28 }
    },
    "climateRisk": {
      "physicalRiskExposure": 450000000,
      "transitionRiskExposure": 280000000
    }
  }
}`,
    fieldMappings: [
      { sourceField: 'd.financials.netRevenue', esrsMetric: 'ESRS2_SBM1_REVENUE_TOTAL', esrsName: 'Total net revenue' },
      { sourceField: 'd.taxonomyAlignment.turnover.aligned_pct', esrsMetric: 'TAX_TURNOVER_ALIGNED_PCT', esrsName: 'Taxonomy-aligned turnover %' },
      { sourceField: 'd.taxonomyAlignment.capex.aligned_pct', esrsMetric: 'TAX_CAPEX_ALIGNED_PCT', esrsName: 'Taxonomy-aligned CapEx %' },
      { sourceField: 'd.climateRisk.physicalRiskExposure', esrsMetric: 'E1_9_PHYSICAL_RISK_ASSETS', esrsName: 'Physical risk assets' },
    ],
  },
  mock_ecovadis: {
    displayName: 'EcoVadis', vendor: 'EcoVadis SAS', apiFormat: 'REST API v1',
    authTypes: ['API Key'], docsUrl: 'https://api.ecovadis.com/docs',
    defaultEndpoint: 'https://api.ecovadis.com/v1/scorecards/export',
    description: 'Supplier sustainability ratings. Provides supply chain ESG scores, findings (forced/child labour), and material flow data.',
    domain: 'Procurement / Supply Chain', esrsCoverage: ['S2', 'E5'],
    sampleRequest: `GET /v1/scorecards/export?year=2024\nHost: api.ecovadis.com\nAuthorization: ApiKey {key}`,
    sampleResponse: `{ "supplierPortfolio": { "totalSuppliers": 1600, "assessed": 1250, "assessedPercentage": 78, "findings": { "forcedLabour": { "incidents": 0 } } }, "materialFlows": { "totalMaterialsProcured_tonnes": 125000, "recycledContentPercentage": 25 } }`,
    fieldMappings: [
      { sourceField: 'supplierPortfolio.assessed', esrsMetric: 'S2_4_SUPPLIERS_ASSESSED', esrsName: 'Suppliers assessed' },
      { sourceField: 'supplierPortfolio.findings.forcedLabour.incidents', esrsMetric: 'S2_4_FORCED_LABOUR_INCIDENTS', esrsName: 'Forced labour incidents' },
      { sourceField: 'materialFlows.recycledContentPercentage', esrsMetric: 'E5_4_RECYCLED_CONTENT_PCT', esrsName: 'Recycled content %' },
    ],
  },
  mock_ethicspoint: {
    displayName: 'NAVEX EthicsPoint', vendor: 'NAVEX Global', apiFormat: 'REST API v2',
    authTypes: ['API Key', 'OAuth 2.0'], docsUrl: 'https://api.navex.com/docs',
    defaultEndpoint: 'https://api.navex.com/v2/analytics/summary',
    description: 'Ethics & compliance platform. Provides whistleblower case metrics, compliance training data, corruption incidents, and payment practices.',
    domain: 'Legal / Governance', esrsCoverage: ['G1'],
    sampleRequest: `GET /v2/analytics/summary?period=2024\nHost: api.navex.com\nAuthorization: Bearer {token}`,
    sampleResponse: `{ "caseMetrics": { "totalReportsReceived": 42, "totalReportsClosed": 38, "byCategory": [{ "category": "Workplace conduct", "count": 15 }] }, "corruptionMetrics": { "confirmedIncidents": 1 }, "paymentPractices": { "onTimePaymentRate": 87, "daysPayableOutstanding": 52 } }`,
    fieldMappings: [
      { sourceField: 'caseMetrics.totalReportsReceived', esrsMetric: 'G1_1_WHISTLEBLOWER_REPORTS', esrsName: 'Whistleblower reports' },
      { sourceField: 'corruptionMetrics.confirmedIncidents', esrsMetric: 'G1_4_CORRUPTION_INCIDENTS', esrsName: 'Corruption incidents' },
      { sourceField: 'paymentPractices.onTimePaymentRate', esrsMetric: 'G1_6_ONTIME_PAYMENT_PCT', esrsName: 'On-time payment %' },
    ],
  },
  mock_sphera: {
    displayName: 'Sphera', vendor: 'Sphera Solutions', apiFormat: 'REST API v1',
    authTypes: ['API Key', 'OAuth 2.0'], docsUrl: 'https://docs.sphera.com/api',
    defaultEndpoint: 'https://api.sphera.com/v1/products/compliance/export',
    description: 'Product stewardship and EHS platform. Chemical compliance (REACH/CLP), product safety incidents, biodiversity screening, and circular economy metrics.',
    domain: 'Product Safety / EHS', esrsCoverage: ['E2', 'E4', 'E5', 'S4'],
    sampleRequest: `GET /v1/products/compliance/export?scope=corporate&year=2024
Host: api.sphera.com
Authorization: Bearer {api_key}
Accept: application/json`,
    sampleResponse: `{
  "exportInfo": {
    "systemId": "SPHERA-PROD-EU",
    "scope": "Corporate"
  },
  "chemicalCompliance": {
    "substancesOfConcern": {
      "totalVolume_tonnes": 4200,
      "substanceCount": 156,
      "reachRegistered": 148
    },
    "svhcSubstances": {
      "totalVolume_tonnes": 180,
      "candidateListMatches": 8
    }
  },
  "productSafety": {
    "safetyIncidents": 2,
    "customerComplaints": 156
  },
  "landUse": {
    "totalOperationalArea_ha": 850,
    "nearProtectedAreas_ha": 12,
    "iucnSpeciesAffected": 3
  }
}`,
    fieldMappings: [
      { sourceField: 'chemicalCompliance.substancesOfConcern.totalVolume_tonnes', esrsMetric: 'E2_5_SUBSTANCES_OF_CONCERN', esrsName: 'Substances of concern' },
      { sourceField: 'chemicalCompliance.svhcSubstances.totalVolume_tonnes', esrsMetric: 'E2_5_SVHC_SUBSTANCES', esrsName: 'SVHC substances' },
      { sourceField: 'landUse.totalOperationalArea_ha', esrsMetric: 'E4_5_LAND_USE_TOTAL', esrsName: 'Total land use' },
      { sourceField: 'landUse.nearProtectedAreas_ha', esrsMetric: 'E4_5_LAND_USE_PROTECTED', esrsName: 'Near protected areas' },
      { sourceField: 'landUse.iucnSpeciesAffected', esrsMetric: 'E4_5_SPECIES_AT_RISK', esrsName: 'IUCN species at risk' },
      { sourceField: 'circularEconomy.renewableMaterials_tonnes', esrsMetric: 'E5_4_MATERIALS_RENEWABLE', esrsName: 'Renewable materials' },
      { sourceField: 'circularEconomy.wasteRecycled_tonnes', esrsMetric: 'E5_5_WASTE_RECYCLED', esrsName: 'Waste recycled' },
      { sourceField: 'productSafety.safetyIncidents', esrsMetric: 'S4_4_PRODUCT_SAFETY_INCIDENTS', esrsName: 'Product safety incidents' },
      { sourceField: 'productSafety.customerComplaints', esrsMetric: 'S4_4_CUSTOMER_COMPLAINTS', esrsName: 'Customer complaints' },
    ],
  },
  mock_workday: {
    displayName: 'Workday HCM', vendor: 'Workday Inc.', apiFormat: 'REST (RAAS Reports)',
    authTypes: ['OAuth 2.0', 'API Key'], docsUrl: 'https://community.workday.com/api',
    defaultEndpoint: 'https://wd5-impl-services1.workday.com/ccx/api/analytics/v1/reports',
    description: 'Human Capital Management platform. Provides workforce demographics, training, compensation, and benefits data via custom RAAS (Report-as-a-Service) exports.',
    domain: 'HR / People', esrsCoverage: ['S1'],
    sampleRequest: `GET /ccx/api/analytics/v1/reports/ESRS_Workforce_Export
Host: wd5-impl-services1.workday.com
Authorization: Bearer {oauth_token}
Accept: application/json`,
    sampleResponse: `{
  "Report_Name": "ESRS_Workforce_Export_FY2024",
  "Organization": {
    "Organization_ID": "ACME_GLOBAL",
    "Organization_Name": "Acme Corporation"
  },
  "Report_Entry": [
    {
      "Worker_Group": "All Workers",
      "Metric_ID": "WD-HC-FT",
      "Metric_Name": "Full-Time Headcount",
      "Value": 31050
    },
    {
      "Worker_Group": "All Workers",
      "Metric_ID": "WD-DEI-DISABILITY",
      "Metric_Name": "Disability Disclosure Rate",
      "Value": 3.8
    },
    {
      "Worker_Group": "Executive",
      "Metric_ID": "WD-COMP-RATIO",
      "Metric_Name": "CEO-to-Median Pay Ratio",
      "Value": 42
    }
  ]
}`,
    fieldMappings: [
      { sourceField: 'Report_Entry[WD-HC-FT].Value', esrsMetric: 'S1_6_EMPLOYEES_FULLTIME', esrsName: 'Full-time employees' },
      { sourceField: 'Report_Entry[WD-HC-PT].Value', esrsMetric: 'S1_6_EMPLOYEES_PARTTIME', esrsName: 'Part-time employees' },
      { sourceField: 'Report_Entry[WD-CW-TOTAL].Value', esrsMetric: 'S1_7_NONEMPLOYEE_WORKERS', esrsName: 'Non-employee workers' },
      { sourceField: 'Report_Entry[WD-DEI-DISABILITY].Value', esrsMetric: 'S1_12_DISABILITY_PCT', esrsName: 'Persons with disabilities %' },
      { sourceField: 'Report_Entry[WD-LEAVE-ENTITLED].Value', esrsMetric: 'S1_15_FAMILY_LEAVE_ENTITLED_PCT', esrsName: 'Family leave entitlement %' },
      { sourceField: 'Report_Entry[WD-LRN-HOURS].Value', esrsMetric: 'S1_13_TRAINING_HOURS_TOTAL', esrsName: 'Total training hours' },
      { sourceField: 'Report_Entry[WD-TERM-INVOL].Value', esrsMetric: 'S1_6_INVOLUNTARY_TURNOVER_RATE', esrsName: 'Involuntary turnover rate' },
      { sourceField: 'Report_Entry[WD-COMP-RATIO].Value', esrsMetric: 'S1_16_CEO_PAY_RATIO', esrsName: 'CEO pay ratio' },
    ],
  },
  mock_cdp: {
    displayName: 'CDP', vendor: 'CDP Worldwide', apiFormat: 'REST API v1',
    authTypes: ['API Key'], docsUrl: 'https://guidance.cdp.net/en/tags?cid=api',
    defaultEndpoint: 'https://api.cdp.net/v1/responses/climate-change/2024',
    description: 'Carbon Disclosure Project — the primary investor-driven climate disclosure platform. Provides governance, targets, and transition plan data already reported by the company.',
    domain: 'Climate Disclosure', esrsCoverage: ['ESRS_2', 'E1'],
    sampleRequest: `GET /v1/responses/climate-change/2024
Host: api.cdp.net
Authorization: ApiKey {key}
Accept: application/json`,
    sampleResponse: `{
  "responseMetadata": {
    "accountId": "CDP-ACME-2024",
    "questionnaire": "Climate Change 2024",
    "score": "A-",
    "submissionDate": "2024-07-31"
  },
  "governance": {
    "boardOversight": true,
    "dedicatedCommittee": true,
    "sustainabilityIncentives": true,
    "incentivePercentage": 15
  },
  "targets": {
    "hasScienceBasedTarget": true,
    "targetYear": 2030,
    "reductionPercentage": 42,
    "scope": "Scope 1+2",
    "status": "Validated by SBTi"
  },
  "transitionPlan": {
    "alignedWith15C": true
  }
}`,
    fieldMappings: [
      { sourceField: 'transitionPlan.alignedWith15C', esrsMetric: 'E1_1_TRANSITION_PLAN_ALIGNED', esrsName: 'Paris-aligned transition plan' },
      { sourceField: 'targets.reductionPercentage', esrsMetric: 'E1_4_GHG_REDUCTION_TARGET_PCT', esrsName: 'GHG reduction target %' },
      { sourceField: 'targets.targetYear', esrsMetric: 'E1_4_GHG_TARGET_YEAR', esrsName: 'Target year' },
      { sourceField: 'governance.boardOversight', esrsMetric: 'ESRS2_GOV1_BOARD_SUSTAINABILITY_OVERSIGHT', esrsName: 'Board sustainability oversight' },
      { sourceField: 'governance.dedicatedCommittee', esrsMetric: 'ESRS2_GOV1_SUSTAINABILITY_COMMITTEE', esrsName: 'Sustainability committee' },
      { sourceField: 'governance.sustainabilityIncentives', esrsMetric: 'ESRS2_GOV3_SUSTAINABILITY_REMUNERATION', esrsName: 'Sustainability remuneration' },
      { sourceField: 'governance.incentivePercentage', esrsMetric: 'ESRS2_GOV3_SUSTAINABILITY_REMUNERATION_PCT', esrsName: 'Remuneration linked %' },
    ],
  },
  mock_celonis: {
    displayName: 'Celonis', vendor: 'Celonis SE', apiFormat: 'REST API',
    authTypes: ['OAuth 2.0', 'API Key'], docsUrl: 'https://developer.celonis.com',
    defaultEndpoint: 'https://acme.celonis.cloud/integration/api/v1/data-pools/export',
    description: 'Process mining platform. Analyzes operational data from ERP/MES systems to surface environmental inefficiencies, resource waste, and safety patterns.',
    domain: 'Process Mining', esrsCoverage: ['E1', 'E3', 'E5', 'S1'],
    sampleRequest: `POST /integration/api/v1/data-pools/dp-acme-prod/export
Host: acme.celonis.cloud
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "analysisId": "CEL-ESG-2024-Q4",
  "processScope": "Manufacturing + Logistics"
}`,
    sampleResponse: `{
  "analysisExport": {
    "analysisId": "CEL-ESG-2024-Q4",
    "dataPoolId": "dp-acme-prod",
    "processScope": "Manufacturing + Logistics"
  },
  "operationalInsights": {
    "waterManagement": {
      "recycledVolume_ML": 5.8,
      "waterIntensity_MLPerMRevenue": 1.16
    },
    "wasteFromProcesses": {
      "nonHazardousWaste_tonnes": 13700
    },
    "energyFromProcesses": {
      "nonRenewableConsumption_MWh": 510000
    },
    "safetyFromProcessAnalysis": {
      "recordableIncidents": 23,
      "daysLostToInjury": 412,
      "occupationalDiseases": 5,
      "nearMisses": 142
    }
  }
}`,
    fieldMappings: [
      { sourceField: 'operationalInsights.waterManagement.recycledVolume_ML', esrsMetric: 'E3_4_WATER_RECYCLED', esrsName: 'Water recycled' },
      { sourceField: 'operationalInsights.waterManagement.waterIntensity_MLPerMRevenue', esrsMetric: 'E3_4_WATER_INTENSITY', esrsName: 'Water intensity' },
      { sourceField: 'operationalInsights.wasteFromProcesses.nonHazardousWaste_tonnes', esrsMetric: 'E5_5_WASTE_NONHAZARDOUS', esrsName: 'Non-hazardous waste' },
      { sourceField: 'operationalInsights.energyFromProcesses.nonRenewableConsumption_MWh', esrsMetric: 'E1_5_ENERGY_CONSUMPTION_NONRENEWABLE', esrsName: 'Non-renewable energy' },
      { sourceField: 'operationalInsights.safetyFromProcessAnalysis.recordableIncidents', esrsMetric: 'S1_14_RECORDABLE_INCIDENTS', esrsName: 'Recordable incidents' },
      { sourceField: 'operationalInsights.safetyFromProcessAnalysis.daysLostToInjury', esrsMetric: 'S1_14_DAYS_LOST', esrsName: 'Days lost to injury' },
      { sourceField: 'operationalInsights.safetyFromProcessAnalysis.occupationalDiseases', esrsMetric: 'S1_14_OCCUPATIONAL_DISEASE', esrsName: 'Occupational diseases' },
    ],
  },
  mock_coupa: {
    displayName: 'Coupa', vendor: 'Coupa Software', apiFormat: 'REST API',
    authTypes: ['OAuth 2.0', 'API Key'], docsUrl: 'https://compass.coupa.com/api',
    defaultEndpoint: 'https://acme.coupahost.com/api/suppliers/compliance/export',
    description: 'Business Spend Management platform. Provides supplier compliance data, community impact metrics, human rights findings, and environmental supply chain data.',
    domain: 'Procurement', esrsCoverage: ['S2', 'S3', 'S1', 'E4'],
    sampleRequest: `GET /api/suppliers/compliance/export?fiscal_year=2024
Host: acme.coupahost.com
Authorization: Bearer {oauth_token}
Accept: application/json`,
    sampleResponse: `{
  "exportMetadata": {
    "instanceUrl": "https://acme.coupahost.com",
    "currency": "EUR"
  },
  "supplierCompliance": {
    "totalActiveSuppliers": 1600,
    "suppliersAssessedForSocialImpact": 890,
    "highRiskSuppliers": 45
  },
  "communityImpact": {
    "grievancesReceived": 7,
    "grievancesResolved": 5
  },
  "humanRights": {
    "discriminationIncidentsReported": 3,
    "humanRightsComplaintsReceived": 8,
    "modernSlaveryStatementPublished": true
  },
  "environmentalSupplyChain": {
    "landUseChangeFromSourcing_ha": 2.5
  }
}`,
    fieldMappings: [
      { sourceField: 'supplierCompliance.suppliersAssessedForSocialImpact', esrsMetric: 'S2_4_SUPPLIERS_ASSESSED', esrsName: 'Suppliers assessed' },
      { sourceField: 'communityImpact.grievancesReceived', esrsMetric: 'S3_4_COMMUNITY_GRIEVANCES', esrsName: 'Community grievances' },
      { sourceField: 'humanRights.discriminationIncidentsReported', esrsMetric: 'S1_17_DISCRIMINATION_INCIDENTS', esrsName: 'Discrimination incidents' },
      { sourceField: 'humanRights.humanRightsComplaintsReceived', esrsMetric: 'S1_17_HUMAN_RIGHTS_COMPLAINTS', esrsName: 'Human rights complaints' },
      { sourceField: 'environmentalSupplyChain.landUseChangeFromSourcing_ha', esrsMetric: 'E4_5_LAND_USE_CHANGE', esrsName: 'Land use change' },
    ],
  },
  mock_powerbi: {
    displayName: 'Power BI', vendor: 'Microsoft', apiFormat: 'REST API (DAX Queries)',
    authTypes: ['OAuth 2.0 (Azure AD)'], docsUrl: 'https://learn.microsoft.com/en-us/rest/api/power-bi/',
    defaultEndpoint: 'https://api.powerbi.com/v1.0/myorg/datasets/{datasetId}/executeQueries',
    description: 'Business Intelligence platform. Serves as a reporting layer aggregating ESG data from multiple department dashboards into consolidated exports.',
    domain: 'Business Intelligence', esrsCoverage: ['E1', 'E2', 'E3', 'S1'],
    sampleRequest: `POST /v1.0/myorg/datasets/ds-acme-esg/executeQueries
Host: api.powerbi.com
Authorization: Bearer {azure_ad_token}
Content-Type: application/json

{
  "queries": [{
    "query": "EVALUATE SUMMARIZE(ESG_KPIs, ESG_KPIs[Measure], ESG_KPIs[Value], ESG_KPIs[Department])"
  }]
}`,
    sampleResponse: `{
  "requestId": "pbi-esg-export-20250120",
  "datasetId": "ds-acme-esg-consolidated",
  "reportName": "ESG Consolidated KPIs Q4 2024",
  "results": [{
    "tables": [{
      "rows": [
        {
          "measure": "GHG_Scope2_Location",
          "category": "Emissions",
          "value": 44200,
          "unit": "tCO2e",
          "department": "Sustainability",
          "lastRefreshed": "2025-01-15T06:00:00Z"
        },
        {
          "measure": "Water_Stress_Areas",
          "category": "Water",
          "value": 3.2,
          "unit": "ML",
          "department": "HSE&S"
        }
      ]
    }]
  }]
}`,
    fieldMappings: [
      { sourceField: 'results[].rows[measure=GHG_Scope2_Location].value', esrsMetric: 'E1_6_GHG_SCOPE2_LOCATION', esrsName: 'Scope 2 GHG (location)' },
      { sourceField: 'results[].rows[measure=GHG_Total].value', esrsMetric: 'E1_6_GHG_TOTAL', esrsName: 'Total GHG emissions' },
      { sourceField: 'results[].rows[measure=Soil_Pollutants].value', esrsMetric: 'E2_4_SOIL_POLLUTANTS', esrsName: 'Soil pollutants' },
      { sourceField: 'results[].rows[measure=Water_Discharge].value', esrsMetric: 'E3_4_WATER_DISCHARGE_TOTAL', esrsName: 'Water discharge' },
      { sourceField: 'results[].rows[measure=Water_Stress_Areas].value', esrsMetric: 'E3_4_WATER_STRESS_AREAS', esrsName: 'Water stress areas' },
      { sourceField: 'results[].rows[measure=Collective_Bargaining].value', esrsMetric: 'S1_8_COLLECTIVE_BARGAINING_PCT', esrsName: 'Collective bargaining %' },
    ],
  },
};

export function ConnectorDetailPage() {
  const { connectorType } = useParams<{ connectorType: string }>();
  const navigate = useNavigate();
  const { tenant } = useAuth();
  const [mode, setMode] = useState<'mock' | 'live'>('mock');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; accepted: number; errors: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'response' | 'mapping'>('overview');

  const meta = CONNECTOR_META[connectorType || ''];

  useEffect(() => {
    if (meta) setEndpoint(meta.defaultEndpoint);
  }, [meta]);

  async function testConnection() {
    if (!tenant || !connectorType) return;
    setTesting(true);
    setTestResult(null);
    try {
      const periodsRes = await api<{ data: any[] }>('/data/periods');
      if (periodsRes.data.length === 0) { setTestResult({ success: false, accepted: 0, errors: ['Create a reporting period first'] }); return; }

      const res = await api<{ data: { accepted: number; rejected: number; errors: string[] } }>(
        `/ingest/${connectorType}`,
        { method: 'POST', body: { reportingPeriodId: periodsRes.data[0].id, payload: {} } },
      );
      setTestResult({ success: res.data.errors.length === 0, accepted: res.data.accepted, errors: res.data.errors });
    } catch (err: any) {
      setTestResult({ success: false, accepted: 0, errors: [err.message] });
    } finally {
      setTesting(false);
    }
  }

  if (!meta || !connectorType) {
    return <div className="text-slate-500">Connector not found.</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/connectors')} className="text-slate-400 hover:text-slate-600 text-xl">&larr;</button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{meta.displayName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">{meta.vendor}</span>
              <span className="text-xs text-slate-300">|</span>
              <span className="text-xs text-slate-400">{meta.apiFormat}</span>
              <span className="text-xs text-slate-300">|</span>
              <span className="text-xs text-slate-400">{meta.domain}</span>
            </div>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button onClick={() => setMode('mock')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'mock' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
            Mock
          </button>
          <button onClick={() => setMode('live')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${mode === 'live' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>
            Live
          </button>
        </div>
      </div>

      {/* Description + ESRS coverage */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
        <p className="text-sm text-slate-600 mb-3">{meta.description}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">ESRS Coverage:</span>
          {meta.esrsCoverage.map((s) => (
            <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{s}</span>
          ))}
        </div>
      </div>

      {/* Live mode: configuration */}
      {mode === 'live' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-5">
          <div className="text-sm font-semibold text-amber-800 mb-3">Live Connection Configuration</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">API Endpoint</label>
              <input value={endpoint} onChange={(e) => setEndpoint(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Authentication</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                {meta.authTypes.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">API Key / Token</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" placeholder="Enter your API key..." />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2">When live mode is active, the platform will call the real API endpoint instead of using mock data.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['overview', 'request', 'response', 'mapping'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {tab === 'mapping' ? 'Field Mapping' : tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {activeTab === 'overview' && (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Mode</div>
                <div className="font-medium text-slate-800 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${mode === 'mock' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  {mode === 'mock' ? 'Mock (Development)' : 'Live (Production)'}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Endpoint</div>
                <div className="font-mono text-xs text-slate-800 truncate">{endpoint}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Authentication</div>
                <div className="font-medium text-slate-800">{meta.authTypes.join(', ')}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">Metrics Mapped</div>
                <div className="font-medium text-slate-800">{meta.fieldMappings.length} fields</div>
              </div>
            </div>

            {/* Test connection */}
            <div className="border-t border-slate-100 pt-4">
              <button onClick={testConnection} disabled={testing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50">
                {testing ? 'Testing...' : 'Test Connection & Import'}
              </button>
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {testResult.success
                    ? `Success! ${testResult.accepted} metrics imported.`
                    : `Failed: ${testResult.errors.join(', ')}`}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'request' && (
          <div className="p-1">
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Request</div>
              <pre className="text-sm font-mono text-emerald-400 whitespace-pre leading-relaxed">{meta.sampleRequest}</pre>
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div className="p-1">
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Response</div>
              <pre className="text-sm font-mono text-blue-400 whitespace-pre leading-relaxed">
                {(() => { try { return JSON.stringify(JSON.parse(meta.sampleResponse), null, 2); } catch { return meta.sampleResponse; } })()}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'mapping' && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left font-medium text-slate-500">Source Field</th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">→</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">ESRS Metric</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Description</th>
              </tr>
            </thead>
            <tbody>
              {meta.fieldMappings.map((fm, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{fm.sourceField}</td>
                  <td className="px-4 py-2.5 text-center text-slate-300">→</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono">{fm.esrsMetric}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{fm.esrsName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
