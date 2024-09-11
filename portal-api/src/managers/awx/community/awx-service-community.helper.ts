import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';

interface InputAddServiceCommunityAWX {
  id: string;
}

interface AWXServiceCommunity {
  awx_client_request_id: string;
  community_id: string;
  service_type: string;
  service_id: string;
  service_display_name: string;
}

export const mapAddServiceCommunityAWX = (
  { id: community_id }: InputAddServiceCommunityAWX,
  awx_client_request_id: ActionTrackingId
): AWXServiceCommunity => {
  return {
    awx_client_request_id,
    community_id,
    service_type: 'weather',
    service_id: 'weather',
    service_display_name: 'Weather',
  };
};

export const mapUpdateServiceCommunityAWX = (
  { id: community_id }: InputAddServiceCommunityAWX,
  awx_client_request_id: ActionTrackingId
): Omit<AWXServiceCommunity, 'service_type'> => {
  return {
    awx_client_request_id,
    community_id,
    service_id: 'weather',
    service_display_name: 'Weather',
  };
};
export const mapDeleteServiceCommunityAWX = (
  { id: community_id }: InputAddServiceCommunityAWX,
  awx_client_request_id: ActionTrackingId
): Omit<AWXServiceCommunity, 'service_type'> => {
  return {
    awx_client_request_id,
    community_id,
    service_id: 'weather',
    service_display_name: 'Weather',
  };
};
