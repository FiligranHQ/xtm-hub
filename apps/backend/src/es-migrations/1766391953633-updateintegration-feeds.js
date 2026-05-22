'use strict';

import { esDbClient } from '../thirdparty/elasticsearch/client.js';

export const up = async function (next) {
  await esDbClient.updateByQuery({
    index: 'telemetry_v1',
    body: {
      script: {
        source: `
            if (ctx._source.service != null && ctx._source.service.contains('integration-feeds-library')) {
              ctx._source.service = 'integrations-library';
            }`,
        lang: 'painless',
      },
    },
    refresh: true,
  });
  next();
};

export const down = async function (next) {
  await esDbClient.updateByQuery({
    index: 'telemetry_v1',
    body: {
      script: {
        source: `
            if (ctx._source.service != null && ctx._source.service.contains('integrations-library')) {
              ctx._source.service = 'integration-feeds-library';
            }`,
        lang: 'painless',
      },
    },
    refresh: true,
  });
  next();
};
