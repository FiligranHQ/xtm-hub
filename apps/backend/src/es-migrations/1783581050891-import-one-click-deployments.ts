'use strict';

import { database } from '../../knexfile.js';
import { esDbClient } from '../thirdparty/elasticsearch/client.js';

// One-time import of the historical ONE_CLICK_DEPLOY telemetry events from
// Elasticsearch into the OneClickDeployment Postgres table.
//
// This lives in the ES migrations (not the PG migrations) on purpose: it runs
// after the PG migrations, once Elasticsearch is confirmed up, and it never
// runs during the PG-only unit-test setup. It runs exactly once (tracked in the
// ES migration store), so real-time dual-write only handles events created
// afterwards and no de-duplication key is needed.
const TELEMETRY_INDEX = 'telemetry';
const ONE_CLICK_DEPLOY_EVENT_TYPE = 'one_click_deploy';
const BATCH_SIZE = 1000;

interface OneClickDeploySource {
  resource_id?: string;
  platform_id?: string;
  tenant_id?: string | null;
  user_id?: string | null;
  '@timestamp': string;
}

export const up = async function (next: () => void) {
  let from = 0;

  for (;;) {
    const response = await esDbClient.search<OneClickDeploySource>({
      index: TELEMETRY_INDEX,
      // A brand-new environment may not have the telemetry index yet.
      ignore_unavailable: true,
      allow_no_indices: true,
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
      await database('OneClickDeployment').insert(rows);
    }

    from += hits.length;
    if (hits.length < BATCH_SIZE) {
      break;
    }
  }

  next();
};

export const down = async function (next: () => void) {
  await database('OneClickDeployment').del();
  next();
};
