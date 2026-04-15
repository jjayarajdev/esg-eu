import { Pool } from 'pg';
import {
  ESRS_STANDARDS,
  ESRS_DISCLOSURE_REQUIREMENTS,
  ESRS_METRIC_DEFINITIONS,
  DEPARTMENT_TEMPLATES,
} from '@esg/esrs-taxonomy';

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://esg:esg_dev@localhost:5433/esg_platform';

/**
 * Seeds the shared schema with ESRS reference data.
 * Idempotent — uses ON CONFLICT DO UPDATE for safe re-runs.
 */
async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log('Seeding shared schema...');
    console.log(`  Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

    // 1. Seed ESRS Standards
    console.log(`\n  Seeding ${ESRS_STANDARDS.length} ESRS standards...`);
    for (const std of ESRS_STANDARDS) {
      await pool.query(
        `INSERT INTO shared.esrs_standards (code, name, category, is_mandatory, description, version, effective_from, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           is_mandatory = EXCLUDED.is_mandatory,
           description = EXCLUDED.description,
           version = EXCLUDED.version,
           sort_order = EXCLUDED.sort_order`,
        [std.code, std.name, std.category, std.isMandatory, std.description, std.version, std.effectiveFrom, std.sortOrder],
      );
    }

    // 2. Seed Disclosure Requirements
    console.log(`  Seeding ${ESRS_DISCLOSURE_REQUIREMENTS.length} disclosure requirements...`);
    for (const dr of ESRS_DISCLOSURE_REQUIREMENTS) {
      // Look up standard ID
      const stdRes = await pool.query(
        'SELECT id FROM shared.esrs_standards WHERE code = $1',
        [dr.standardCode],
      );
      if (stdRes.rows.length === 0) {
        console.warn(`    WARN: Standard ${dr.standardCode} not found, skipping ${dr.code}`);
        continue;
      }

      await pool.query(
        `INSERT INTO shared.esrs_disclosure_requirements (standard_id, code, name, pillar, is_mandatory, description, version, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           pillar = EXCLUDED.pillar,
           is_mandatory = EXCLUDED.is_mandatory,
           description = EXCLUDED.description,
           version = EXCLUDED.version,
           sort_order = EXCLUDED.sort_order`,
        [stdRes.rows[0].id, dr.code, dr.name, dr.pillar, dr.isMandatory, dr.description, dr.version, dr.sortOrder],
      );
    }

    // 3. Seed Metric Definitions
    console.log(`  Seeding ${ESRS_METRIC_DEFINITIONS.length} metric definitions...`);
    for (const m of ESRS_METRIC_DEFINITIONS) {
      const stdRes = await pool.query('SELECT id FROM shared.esrs_standards WHERE code = $1', [m.standardCode]);
      const drRes = await pool.query('SELECT id FROM shared.esrs_disclosure_requirements WHERE code = $1', [m.disclosureReqCode]);

      if (stdRes.rows.length === 0 || drRes.rows.length === 0) {
        console.warn(`    WARN: Missing FK for metric ${m.code}, skipping`);
        continue;
      }

      await pool.query(
        `INSERT INTO shared.esrs_metric_definitions
         (code, standard_id, disclosure_req_id, name, description, data_type, unit,
          is_quantitative, reporting_frequency, aggregation_method, validation_rules,
          enum_values, tags, gri_mapping, issb_mapping, xbrl_tag, version, effective_from, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           data_type = EXCLUDED.data_type,
           unit = EXCLUDED.unit,
           is_quantitative = EXCLUDED.is_quantitative,
           validation_rules = EXCLUDED.validation_rules,
           tags = EXCLUDED.tags,
           gri_mapping = EXCLUDED.gri_mapping,
           issb_mapping = EXCLUDED.issb_mapping,
           version = EXCLUDED.version,
           sort_order = EXCLUDED.sort_order`,
        [
          m.code, stdRes.rows[0].id, drRes.rows[0].id, m.name, m.description,
          m.dataType, m.unit, m.isQuantitative, m.reportingFrequency, m.aggregationMethod,
          m.validationRules ? JSON.stringify(m.validationRules) : null,
          m.enumValues ? JSON.stringify(m.enumValues) : null,
          m.tags, m.griMapping, m.issbMapping, m.xbrlTag, m.version, m.effectiveFrom, m.sortOrder,
        ],
      );
    }

    // 4. Seed Department Templates
    console.log(`  Seeding ${DEPARTMENT_TEMPLATES.length} department templates...`);
    for (const dept of DEPARTMENT_TEMPLATES) {
      await pool.query(
        `INSERT INTO shared.department_templates (code, name, description, default_kpi_pct, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (code) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           default_kpi_pct = EXCLUDED.default_kpi_pct,
           sort_order = EXCLUDED.sort_order`,
        [dept.code, dept.name, dept.description, dept.defaultKpiPct, dept.sortOrder],
      );

      // Seed department-standard mappings
      const deptRes = await pool.query('SELECT id FROM shared.department_templates WHERE code = $1', [dept.code]);
      for (const stdCode of dept.defaultStandards) {
        const stdRes = await pool.query('SELECT id FROM shared.esrs_standards WHERE code = $1', [stdCode]);
        if (deptRes.rows.length > 0 && stdRes.rows.length > 0) {
          await pool.query(
            `INSERT INTO shared.department_standard_mapping (department_template_id, standard_id)
             VALUES ($1, $2)
             ON CONFLICT (department_template_id, standard_id) DO NOTHING`,
            [deptRes.rows[0].id, stdRes.rows[0].id],
          );
        }
      }
    }

    console.log('\nSeed complete!');

    // Summary
    const counts = await pool.query(`
      SELECT
        (SELECT count(*) FROM shared.esrs_standards) as standards,
        (SELECT count(*) FROM shared.esrs_disclosure_requirements) as disclosures,
        (SELECT count(*) FROM shared.esrs_metric_definitions) as metrics,
        (SELECT count(*) FROM shared.department_templates) as departments,
        (SELECT count(*) FROM shared.department_standard_mapping) as dept_mappings
    `);
    const c = counts.rows[0];
    console.log(`  Standards: ${c.standards}`);
    console.log(`  Disclosure Requirements: ${c.disclosures}`);
    console.log(`  Metric Definitions: ${c.metrics}`);
    console.log(`  Department Templates: ${c.departments}`);
    console.log(`  Department-Standard Mappings: ${c.dept_mappings}`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
