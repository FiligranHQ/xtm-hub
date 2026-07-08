// One-time import of the historical ONE_CLICK_DEPLOY telemetry events from
// Elasticsearch into the OneClickDeployment table. Runs exactly once (tracked
// by knex), so no de-duplication key is needed: real-time dual-write only
// handles events created after this migration.
const TELEMETRY_INDEX = 'telemetry';
const ONE_CLICK_DEPLOY_EVENT_TYPE = 'one_click_deploy';
const BATCH_SIZE = 1000;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // The test DB setup runs migrations without Elasticsearch; there is no
  // history to import there, so skip the ES read.
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // Imported lazily so loading this migration file never requires the ES
  // client module (e.g. in the test migration runner).
  const { esDbClient } = await import('../thirdparty/elasticsearch/client');

  let from = 0;

  for (;;) {
    const response = await esDbClient.search({
      index: TELEMETRY_INDEX,
      from,
      size: BATCH_SIZE,
      query: { term: { event_type: ONE_CLICK_DEPLOY_EVENT_TYPE } },
      sort: [{ '@timestamp': { order: 'asc' } }],
    });

    const hits = response.hits.hits;
    if (hits.length === 0) {
      break;
    }

    const rows = hits.flatMap((hit) => {
      const source = hit._source;
      // Skip legacy/incomplete events that predate these required fields.
      if (!source || !source.resource_id || !source.platform_id) {
        return [];
      }
      return [
        {
          resource_id: source.resource_id,
          platform_id: source.platform_id,
          tenant_id: source.tenant_id ?? null,
          user_id: source.user_id ?? null,
          deployed_at: new Date(source['@timestamp']),
        },
      ];
    });

    if (rows.length > 0) {
      await knex('OneClickDeployment').insert(rows);
    }

    from += hits.length;
    if (hits.length < BATCH_SIZE) {
      break;
    }
  }
}

/**
 * Clears the table. There is no marker distinguishing imported rows from
 * dual-written ones, so a rollback resets the whole table (only relevant in dev;
 * this migration is never rolled back in production).
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex('OneClickDeployment').del();
}
