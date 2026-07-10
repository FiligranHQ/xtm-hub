'use strict';

import { estypes } from '@elastic/elasticsearch';
import knex from 'knex';
import { baseConfig } from '../../knexconfig';
import { esDbClient } from '../thirdparty/elasticsearch/client';

const TELEMETRY_INDEX = 'telemetry';
const ONE_CLICK_DEPLOY_EVENT_TYPE = 'one_click_deploy';
const BATCH_SIZE = 1000;

interface OneClickDeploySource {
  resource_id?: string;
  platform_id?: string;
  tenant_id?: string | null;
  user_id?: string | null;
  organization_id?: string | null;
  target_product?: string | null;
  '@timestamp': string;
}

export const up = async function (next: () => void) {
  const database = knex(baseConfig);

  try {
    await database('OneClickDeployment').del();

    let searchAfter: estypes.SortResults | undefined;

    for (;;) {
      const response = await esDbClient.search<OneClickDeploySource>({
        index: TELEMETRY_INDEX,
        ignore_unavailable: true,
        allow_no_indices: true,
        size: BATCH_SIZE,
        query: { term: { event_type: ONE_CLICK_DEPLOY_EVENT_TYPE } },
        sort: [
          { '@timestamp': { order: 'asc' } },
          { resource_id: { order: 'asc' } },
        ],
        search_after: searchAfter,
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
            organization_id: source.organization_id ?? null,
            target_product: source.target_product ?? null,
            deployed_at: new Date(source['@timestamp']),
          },
        ];
      });

      if (rows.length > 0) {
        await database('OneClickDeployment').insert(rows);
      }

      searchAfter = hits.at(-1)?.sort;
      if (hits.length < BATCH_SIZE) {
        break;
      }
    }
  } finally {
    await database.destroy();
  }

  next();
};

export const down = async function (next: () => void) {
  next();
};
