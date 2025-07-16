import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';
import { SubscriptionId } from '../../../model/kanel/public/Subscription';

export interface AWXServiceOrganization {
  awx_client_request_id: string;
  organization_name: string;
  service_type: string;
  subscription_id: SubscriptionId;
  service_display_name: string;
  subscription_user_list: string[];
  service_config?: JSON;
}

export interface AWXServiceOrganizationFormatted
  extends Omit<AWXServiceOrganization, 'subscription_user_list'> {
  subscription_user_list: string;
}

export interface InputServiceOrganization {
  organization_name;
}

export const mapAddServiceOrganizationAWX = (
  { organization_name }: InputServiceOrganization,
  awx_client_request_id: ActionTrackingId
): AWXServiceOrganizationFormatted => {
  return {
    awx_client_request_id,
    organization_name,
    service_type: 'weather',
    subscription_id: 'weather' as SubscriptionId,
    service_display_name: 'Weather',
    subscription_user_list:
      '["jacques.durand@energy.com", "jean.dupont@example.com"]',
  };
};

export const mapUpdateServiceOrganizationAWX = (
  { organization_name }: InputServiceOrganization,
  awx_client_request_id: ActionTrackingId
): Omit<
  AWXServiceOrganizationFormatted,
  'service_type' | 'subscription_user_list'
> => {
  return {
    awx_client_request_id,
    organization_name,
    subscription_id: 'weather' as SubscriptionId,
    service_display_name: 'Weather',
  };
};

export const mapDeleteServiceOrganizationAWX = (
  { organization_name }: InputServiceOrganization,
  awx_client_request_id: ActionTrackingId
): Omit<
  AWXServiceOrganizationFormatted,
  'service_type' | 'subscription_user_list' | 'service_display_name'
> => {
  return {
    awx_client_request_id,
    organization_name,
    subscription_id: 'weather' as SubscriptionId,
  };
};

export const mapUserInServiceOrganizationAWX = (
  { organization_name }: InputServiceOrganization,
  awx_client_request_id: ActionTrackingId
): Omit<
  AWXServiceOrganizationFormatted,
  'service_type' | 'service_display_name'
> => {
  return {
    awx_client_request_id,
    organization_name,
    subscription_id: 'weather' as SubscriptionId,
    subscription_user_list:
      '["jacques.durand@energy.com", "jean.dupont@example.com"]',
  };
};
