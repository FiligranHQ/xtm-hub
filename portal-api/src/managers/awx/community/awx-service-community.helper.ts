import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';

export interface InputAddServiceCommunityAWX {
  id: string;
  service_type: string;
  service_id: string;
  service_display_name: string;
}

interface AWXServiceCommunity {
  awx_client_request_id: string;
  community_id: string;
  service_type: string;
  service_id: string;
  service_display_name: string;
}

export const mapAddServiceCommunityAWX = (
  {
    id,
    service_type,
    service_id,
    service_display_name,
  }: InputAddServiceCommunityAWX,
  awx_client_request_id: ActionTrackingId
): AWXServiceCommunity => {
  return {
    awx_client_request_id,
    community_id: id,
    service_type,
    service_id,
    service_display_name,
  };
};

export const mapUpdateServiceCommunityAWX = (
  {
    id,
    service_id,
    service_display_name,
  }: Omit<InputAddServiceCommunityAWX, 'service_type'>,
  awx_client_request_id: ActionTrackingId
): Omit<AWXServiceCommunity, 'service_type'> => {
  return {
    awx_client_request_id,
    community_id: id,
    service_id,
    service_display_name,
  };
};
export const mapDeleteServiceCommunityAWX = (
  {
    id,
    service_id,
  }: Omit<InputAddServiceCommunityAWX, 'service_type' | 'service_display_name'>,
  awx_client_request_id: ActionTrackingId
): Omit<AWXServiceCommunity, 'service_type' | 'service_display_name'> => {
  return {
    awx_client_request_id,
    community_id: id,
    service_id,
  };
};
