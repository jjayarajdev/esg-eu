import { useState } from 'react';

/** Sample payload snippets showing what each source system sends */
const SOURCE_INFO: Record<string, { displayName: string; apiFormat: string; samplePayload: string; fields: string[] }> = {
  mock_enablon: {
    displayName: 'Enablon (Wolters Kluwer)',
    apiFormat: 'REST API — /api/v1/indicators',
    fields: ['emissions.ghgScope1.bySite[]', 'energy.bySource[]', 'water.totalConsumption_ML', 'waste.recyclingRate', 'pollution.airEmissions.NOx_tonnes'],
    samplePayload: `{
  "exportMetadata": {
    "systemId": "ENABLON-EU-PROD",
    "consolidationLevel": "corporate"
  },
  "emissions": {
    "ghgScope1": {
      "total_tCO2e": 12500,
      "bySite": [
        { "siteId": "NL-AMS-01",
          "siteName": "Amsterdam Plant",
          "value": 4200 }
      ],
      "verificationStatus": "verified"
    }
  }
}`,
  },
  mock_successfactors: {
    displayName: 'SAP SuccessFactors',
    apiFormat: 'OData v2 — /odata/v2/WorkforceAnalytics',
    fields: ['snapshot.headcount.byGender', 'snapshot.headcount.byRegion[]', 'snapshot.compensation.genderPayGap', 'snapshot.healthAndSafety.TRIR'],
    samplePayload: `{
  "d": {
    "__metadata": {
      "type": "SFOData.WorkforceAnalyticsResult"
    },
    "snapshot": {
      "headcount": {
        "total": 34500,
        "byGender": {
          "male": 22080,
          "female": 12420
        },
        "byRegion": [
          { "regionCode": "EU-WEST",
            "count": 18400 }
        ]
      }
    }
  }
}`,
  },
  mock_sap_s4hana: {
    displayName: 'SAP S/4HANA',
    apiFormat: 'OData v4 — /sap/opu/odata4/sap/sustainability',
    fields: ['financials.netRevenue', 'taxonomyAlignment.turnover.aligned_pct', 'climateRisk.physicalRiskExposure'],
    samplePayload: `{
  "d": {
    "companyCode": "1000",
    "fiscalYear": "2024",
    "financials": {
      "netRevenue": 10800000000,
      "capitalExpenditures": 890000000
    },
    "taxonomyAlignment": {
      "turnover": {
        "eligible_pct": 62,
        "aligned_pct": 38
      }
    }
  }
}`,
  },
  mock_ecovadis: {
    displayName: 'EcoVadis',
    apiFormat: 'REST API — /v1/scorecards',
    fields: ['supplierPortfolio.assessed', 'supplierPortfolio.findings.forcedLabour', 'materialFlows.recycledContentPercentage'],
    samplePayload: `{
  "supplierPortfolio": {
    "totalSuppliers": 1600,
    "assessed": 1250,
    "averageScore": 58.4,
    "ratingDistribution": {
      "platinum": 45,
      "gold": 280,
      "silver": 520
    },
    "findings": {
      "forcedLabour": {
        "incidents": 0
      }
    }
  }
}`,
  },
  mock_ethicspoint: {
    displayName: 'NAVEX EthicsPoint',
    apiFormat: 'REST API — /api/v2/cases',
    fields: ['caseMetrics.totalReportsReceived', 'caseMetrics.byCategory[]', 'corruptionMetrics.confirmedIncidents', 'paymentPractices.onTimePaymentRate'],
    samplePayload: `{
  "caseMetrics": {
    "totalReportsReceived": 42,
    "totalReportsClosed": 38,
    "byCategory": [
      { "category": "Workplace conduct",
        "count": 15,
        "substantiated": 8 }
    ],
    "anonymousReports": 18
  },
  "corruptionMetrics": {
    "confirmedIncidents": 1
  }
}`,
  },
  mock_sphera: {
    displayName: 'Sphera',
    apiFormat: 'REST API — /api/v1/products/compliance',
    fields: ['chemicalCompliance.svhcSubstances', 'productSafety.safetyIncidents', 'landUse.iucnSpeciesAffected', 'circularEconomy.wasteRecycled_tonnes'],
    samplePayload: `{
  "chemicalCompliance": {
    "substancesOfConcern": {
      "totalVolume_tonnes": 4200,
      "reachRegistered": 148
    },
    "svhcSubstances": {
      "totalVolume_tonnes": 180,
      "candidateListMatches": 8
    }
  },
  "landUse": {
    "totalOperationalArea_ha": 850,
    "iucnSpeciesAffected": 3
  }
}`,
  },
  mock_workday: {
    displayName: 'Workday HCM',
    apiFormat: 'REST — /ccx/api/analytics/v1/reports',
    fields: ['Report_Entry[].Metric_ID', 'Report_Entry[].Value', 'Organization.Organization_ID'],
    samplePayload: `{
  "Report_Name": "ESRS_Workforce_Export",
  "Report_Entry": [
    { "Worker_Group": "All Workers",
      "Metric_ID": "WD-HC-FT",
      "Metric_Name": "Full-Time Headcount",
      "Value": 31050 },
    { "Metric_ID": "WD-COMP-RATIO",
      "Value": 42 }
  ]
}`,
  },
  mock_cdp: {
    displayName: 'CDP',
    apiFormat: 'REST API — /v1/responses',
    fields: ['governance.boardOversight', 'targets.reductionPercentage', 'transitionPlan.alignedWith15C'],
    samplePayload: `{
  "responseMetadata": {
    "questionnaire": "Climate Change 2024",
    "score": "A-"
  },
  "governance": {
    "boardOversight": true,
    "dedicatedCommittee": true,
    "sustainabilityIncentives": true
  },
  "targets": {
    "targetYear": 2030,
    "reductionPercentage": 42,
    "status": "Validated by SBTi"
  }
}`,
  },
  mock_celonis: {
    displayName: 'Celonis',
    apiFormat: 'REST — /process-analytics/api/analysis',
    fields: ['operationalInsights.waterManagement', 'operationalInsights.safetyFromProcessAnalysis'],
    samplePayload: `{
  "analysisExport": {
    "analysisId": "CEL-ESG-2024-Q4",
    "processScope": "Manufacturing + Logistics"
  },
  "operationalInsights": {
    "safetyFromProcessAnalysis": {
      "recordableIncidents": 23,
      "daysLostToInjury": 412,
      "nearMisses": 142
    }
  }
}`,
  },
  mock_coupa: {
    displayName: 'Coupa',
    apiFormat: 'REST API — /api/suppliers',
    fields: ['supplierCompliance.suppliersAssessed', 'communityImpact.grievancesReceived', 'humanRights.discriminationIncidents'],
    samplePayload: `{
  "supplierCompliance": {
    "totalActiveSuppliers": 1600,
    "suppliersAssessedForSocialImpact": 890,
    "highRiskSuppliers": 45
  },
  "humanRights": {
    "discriminationIncidentsReported": 3,
    "modernSlaveryStatementPublished": true
  }
}`,
  },
  mock_powerbi: {
    displayName: 'Power BI',
    apiFormat: 'REST — /v1.0/myorg/datasets/{id}/executeQueries',
    fields: ['results[].tables[].rows[].measure', 'results[].tables[].rows[].value'],
    samplePayload: `{
  "reportName": "ESG Consolidated KPIs",
  "results": [{
    "tables": [{
      "rows": [
        { "measure": "GHG_Total",
          "category": "Emissions",
          "value": 241700,
          "department": "Sustainability" }
      ]
    }]
  }]
}`,
  },
  manual_entry: {
    displayName: 'Manual Entry',
    apiFormat: 'Platform UI — /data/new',
    fields: ['metricCode', 'numericValue', 'confidenceLevel'],
    samplePayload: `{
  "metricCode": "E1_6_GHG_SCOPE1",
  "reportingPeriodId": "...",
  "numericValue": 12500,
  "confidenceLevel": "measured",
  "dataSource": "manual_entry"
}`,
  },
};

export function SourceTooltip({ source }: { source: string }) {
  const [show, setShow] = useState(false);
  const info = SOURCE_INFO[source];

  if (!info) {
    return <span className="text-xs text-slate-400">{source}</span>;
  }

  const label = source.replace('mock_', '').replace(/_/g, ' ');

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-xs text-blue-600 cursor-help border-b border-dashed border-blue-300 hover:text-blue-800 capitalize"
      >
        {label}
      </span>

      {show && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-[420px] bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden"
          style={{ transform: 'translateX(-30%)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="font-semibold text-sm">{info.displayName}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">{info.apiFormat}</div>
          </div>

          {/* Fields mapped */}
          <div className="px-4 py-2 border-b border-slate-700">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Source fields mapped to ESRS</div>
            <div className="flex flex-wrap gap-1">
              {info.fields.map((f) => (
                <span key={f} className="text-[10px] font-mono bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Payload preview */}
          <div className="px-4 py-2">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Sample payload</div>
            <pre className="text-[10px] font-mono text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
              {info.samplePayload}
            </pre>
          </div>
        </div>
      )}
    </span>
  );
}
