'use strict';

import { esDbClient } from '../thirdparty/elasticsearch/client.js';

export const up = async function (next) {
  await esDbClient.updateByQuery({
    index: 'telemetry_v1',
    body: {
      script: {
        source: `
          if (ctx._source.event != 'register') {
            if (ctx._source.organization_name != null && ctx._source.organization_name.contains('@')) {
              ctx._source.organization_type = 'Personal';
            } else {
              ctx._source.organization_type = 'Professional';
            }
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
          if (ctx._source.event != null && ctx._source.event != 'register') {
            if (ctx._source.containsKey('organization_type')) {
              ctx._source.remove('organization_type');
            }
          }`,
        lang: 'painless',
      },
    },
    refresh: true,
  });

  next();
};
