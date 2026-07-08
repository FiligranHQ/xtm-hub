import { database } from '../../knexfile';
import { OneClickDeploymentDomain } from '../modules/telemetry/one-click-deployment.domain';
import {
  TELEMETRY_INDEX,
  toOneClickDeploymentInitializer,
} from '../modules/telemetry/telemetry.app';
import {
  OneClickDeployEvent,
  TelemetryEventType,
} from '../modules/telemetry/telemetry.types';
import { esDbClient } from '../thirdparty/elasticsearch/client';
import { logApp } from '../utils/app-logger.util';

const BATCH_SIZE = 1000;

async function run(): Promise<void> {
  let searchAfter: unknown[] | undefined;
  let total = 0;

  for (;;) {
    const response = await esDbClient.search<OneClickDeployEvent>({
      index: TELEMETRY_INDEX,
      size: BATCH_SIZE,
      query: { term: { event_type: TelemetryEventType.ONE_CLICK_DEPLOY } },
      sort: [{ '@timestamp': { order: 'asc' } }, { _id: { order: 'asc' } }],
      ...(searchAfter ? { search_after: searchAfter } : {}),
    });

    const hits = response.hits.hits;
    if (hits.length === 0) {
      break;
    }

    const inits = hits.flatMap((hit) =>
      hit._source && hit._id
        ? [
            {
              ...toOneClickDeploymentInitializer(hit._source),
              source_event_id: hit._id,
            },
          ]
        : []
    );

    await OneClickDeploymentDomain.insertMany(inits);
    total += inits.length;
    logApp.info(`Imported ${total} one-click deployments...`);

    searchAfter = hits[hits.length - 1]?.sort;
    if (hits.length < BATCH_SIZE) {
      break;
    }
  }

  logApp.info(`Import done: ${total} one-click deployments processed`);
}

run()
  .then(() => database.destroy())
  .catch(async (error) => {
    logApp.error('One-click deployment import failed', { error });
    await database.destroy();
    process.exit(1);
  });
