import { pathToFileURL } from 'node:url';

// Historical consented v1 cohort only. The corrected native-pageview report
// is in /Users/leo/Projects/tgb-umami/src/lib/home-pageview-report.ts.
// Never changes rows.
export function buildHomeExperimentReport(startIso) {
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) throw new Error('Provide the exact production start as an ISO timestamp.');
  const from = new Date(start).toISOString();
  const cutover = Date.parse('2026-11-25T06:31:07.153Z');
  const to = new Date(Math.min(start + 14 * 86400000, cutover)).toISOString();
  return `-- Historical consented v1 cohort, stopped at the native-pageview correction.
WITH events AS (
  SELECT e.visit_id, e.event_name, e.created_at,
    max(d.string_value) FILTER (WHERE d.data_key = 'experiment') AS experiment,
    max(d.string_value) FILTER (WHERE d.data_key = 'variant') AS variant,
    max(d.string_value) FILTER (WHERE d.data_key = 'viewport') AS viewport,
    max(d.string_value) FILTER (WHERE d.data_key = 'reason') AS reason,
    max(d.string_value) FILTER (WHERE d.data_key = 'qa') AS qa
  FROM website_event e JOIN event_data d ON d.website_event_id = e.event_id
  WHERE e.website_id = '388d24a4-9679-4b9c-992d-5ac0427b099c'
    AND e.hostname IN ('tahitiguestboat.com', 'www.tahitiguestboat.com')
    AND e.event_name IN ('home_intro_exposed', 'home_intro_engaged')
    AND e.created_at >= TIMESTAMPTZ '${from}' AND e.created_at < TIMESTAMPTZ '${to}'
  GROUP BY e.event_id, e.visit_id, e.event_name, e.created_at
), coherent AS (
  SELECT visit_id FROM events WHERE experiment = 'home-intro-v1'
  GROUP BY visit_id HAVING count(DISTINCT variant) = 1 AND NOT bool_or(coalesce(qa, '') = 'true')
), exposure AS (
  SELECT DISTINCT ON (e.visit_id) e.visit_id, e.variant, e.viewport, e.created_at AS exposed_at
  FROM events e JOIN coherent USING (visit_id)
  WHERE e.experiment = 'home-intro-v1' AND e.event_name = 'home_intro_exposed'
  ORDER BY e.visit_id, e.created_at
), visits AS (
  SELECT x.visit_id, x.variant, x.viewport,
    bool_or(e.event_name = 'home_intro_engaged' AND e.created_at >= x.exposed_at) AS engaged,
    bool_or(e.reason = 'next_page' AND e.created_at >= x.exposed_at) AS next_page,
    bool_or(e.reason = '20s_and_section' AND e.created_at >= x.exposed_at) AS time_and_section
  FROM exposure x LEFT JOIN events e ON e.visit_id = x.visit_id AND e.variant = x.variant AND e.experiment = 'home-intro-v1'
  GROUP BY x.visit_id, x.variant, x.viewport
), groups AS (
  SELECT a.variant, s.segment FROM (VALUES ('A'), ('B')) a(variant)
  CROSS JOIN (VALUES ('all'), ('mobile'), ('desktop')) s(segment)
)
SELECT g.variant, g.segment, count(v.visit_id)::int AS exposed_visits,
  count(v.visit_id) FILTER (WHERE v.engaged)::int AS engaged_visits,
  round(100.0 * count(v.visit_id) FILTER (WHERE v.engaged) / nullif(count(v.visit_id), 0), 1) AS engagement_pct,
  count(v.visit_id) FILTER (WHERE v.next_page)::int AS next_page_visits,
  count(v.visit_id) FILTER (WHERE v.time_and_section)::int AS time_and_section_visits,
  (SELECT count(DISTINCT visit_id) FROM events WHERE experiment='home-intro-v1') - (SELECT count(*) FROM coherent) AS mixed_or_qa_visits_excluded
FROM groups g LEFT JOIN visits v ON v.variant = g.variant AND (g.segment = 'all' OR v.viewport = g.segment)
GROUP BY g.variant, g.segment ORDER BY g.segment, g.variant;`;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(buildHomeExperimentReport(process.argv[2]) + '\n');
}
