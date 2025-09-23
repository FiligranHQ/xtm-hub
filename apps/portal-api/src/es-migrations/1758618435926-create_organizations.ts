'use strict';

import { dbUnsecure } from '../../knexfile.js';
import Organization from '../model/kanel/public/Organization.js';
import { buildCreateOrganizationEvent } from '../modules/telemetry/telemetry.helper.js';
import { ADMIN_UUID } from '../portal.const.js';
import { esDbClient } from '../thirdparty/elasticsearch/client';

export const up = async function (next) {
  const organizations = await dbUnsecure<Organization[]>('Organization')
    .where('personal_space', '=', false)
    .select('*');

  const events = organizations.flatMap((orga) => [
    { index: { _index: 'telemetry_v1' } },
    buildCreateOrganizationEvent(orga, ADMIN_UUID, new Date(2025, 1, 1)),
  ]);

  await esDbClient.bulk({ refresh: true, operations: events });
  next();
};

export const down = async function (next) {
  await esDbClient.deleteByQuery({
    index: 'telemetry_v1',
    query: {
      term: {
        event_type: 'create_organization',
      },
    },
  });

  next();
};
