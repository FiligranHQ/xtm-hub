import { Client } from '@elastic/elasticsearch';
import config from 'config';
import fs from 'fs';

const TELEMETRY_INDEX = 'telemetry';
const ONE_CLICK_DEPLOY_EVENT_TYPE = 'one_click_deploy';
const BATCH_SIZE = 1000;

function buildElasticsearchClient() {
  const options = {
    node: `${config.get('elasticsearch.protocol')}://${config.get('elasticsearch.host')}:${config.get('elasticsearch.port')}`,
  };

  const username = config.get('elasticsearch.username');
  const password = config.get('elasticsearch.password');
  if (username && password) {
    options.auth = { username, password };
  }

  const caPath = config.get('elasticsearch.tls.ca_path');
  options.tls = {
    ca: caPath ? fs.readFileSync(caPath) : undefined,
    rejectUnauthorized: config.get('elasticsearch.tls.reject_unauthorized'),
  };

  return new Client(options);
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  const esClient = buildElasticsearchClient();

  try {
    let from = 0;

    for (;;) {
      const response = await esClient.search({
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
  } finally {
    await esClient.close();
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
