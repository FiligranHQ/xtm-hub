import { describe, expect, it } from 'vitest';
import { AWXCommunity, mapCommunityAWX } from './awx-community.helper';
import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';
import { ServiceId } from '../../../model/kanel/public/Service';

describe('Api create-community', async () => {
  it('Should return correct mapping', async () => {
    const expectedResult: AWXCommunity = {
      awx_client_request_id: 'f9d44cd9-ee4f-48af-ac8f-544c6022107b',
      community_id: 'Test',
      community_display_name: 'Test',
      creator_email_address: 'admin@filigran.io',
    };
    const result = await mapCommunityAWX(
      {
        id: '575d37c8-53ed-4c63-ae86-2d8d10f14eaf' as ServiceId,
        adminCommuId: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      },
      'f9d44cd9-ee4f-48af-ac8f-544c6022107b' as ActionTrackingId
    );
    expect(result).toEqual(expectedResult);
  });
});
