import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { UserId } from '../../../model/kanel/public/User';
import { loadUnsecureServiceBy } from '../../../modules/services/services.domain';
import { loadUnsecureUserBy } from '../../../modules/users/users.domain';

export interface InputCreateCommunity {
  id: ServiceInstanceId;
  adminCommuId: UserId;
}

export interface InputUpdateCommunity {
  id: ServiceInstanceId;
  community_display_name: string;
}
export interface AWXCommunity {
  awx_client_request_id: string;
  community_id: string;
  community_display_name: string;
  creator_email_address: string;
}

export const mapUpdateCommunityAWX = async (
  { id, community_display_name }: InputUpdateCommunity,
  awx_client_request_id: ActionTrackingId
): Promise<Omit<AWXCommunity, 'creator_email_address'>> => {
  return {
    awx_client_request_id,
    community_id: id,
    community_display_name,
  };
};

export const mapCreateCommunityAWX = async (
  { id, adminCommuId }: InputCreateCommunity,
  awx_client_request_id: ActionTrackingId
): Promise<AWXCommunity> => {
  const [service] = await loadUnsecureServiceBy({
    id,
  });
  const [user] = await loadUnsecureUserBy({ id: adminCommuId });
  return {
    awx_client_request_id,
    community_id: service.id,
    community_display_name: service.name,
    creator_email_address: user.email,
  };
};

export const mapCommunityIdAWX = (
  community_id: string,
  awx_client_request_id: ActionTrackingId
) => {
  return {
    awx_client_request_id,
    community_id,
  };
};
