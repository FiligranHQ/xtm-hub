import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';
import { loadUnsecureServiceBy } from '../../../modules/services/services.domain';
import { loadUnsecureUserBy } from '../../../modules/users/users.domain';
import { ServiceId } from '../../../model/kanel/public/Service';
import { UserId } from '../../../model/kanel/public/User';

export interface InputCommunity {
  id: ServiceId;
  adminCommuId: string;
}

export interface AWXCommunity {
  awx_client_request_id: string;
  community_id: string;
  community_display_name: string;
  creator_email_address: string;
}

export const mapCommunityAWX = async (
  { id, adminCommuId }: InputCommunity,
  awx_client_request_id: ActionTrackingId
): Promise<AWXCommunity> => {
  const [service] = await loadUnsecureServiceBy({
    id: id,
  });
  const [user] = await loadUnsecureUserBy({ id: adminCommuId as UserId });
  const modifiedData: AWXCommunity = {
    awx_client_request_id,
    community_id: service.name,
    community_display_name: service.name,
    creator_email_address: user.email,
  };
  return modifiedData;
};
