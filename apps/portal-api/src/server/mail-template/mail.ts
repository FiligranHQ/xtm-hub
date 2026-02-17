import { ServiceDefinitionIdentifier } from '../../__generated__/resolvers-types';

export interface GenericServiceMailModel {
  name: string;
  serviceLink: string;
  serviceName: string;
}
export type WelcomeMailModel = Record<string, unknown>;
export interface NewUserOrganizationMailModel {
  organizationName: string;
  userName: string;
  invitedName: string;
}

export interface RequestTransferPersonalSpaceMailModel {
  recipientName: string;
  recipientId: string;
  previousUserId: string;
  previousUserEmail: string;
  previousUserName: string;
  transferRequestId: string;
}

export interface PlatformRegisteredModel {
  adminName: string;
}
export interface OpenCTIFreeTrialRegistered {
  firstName: string;
  platformUrl: string;
}
export interface OpenCTIFreeTrialGenericModel {
  firstName: string;
}
export interface AdminSaasInstanceRequestedModel {
  organizationName: string;
  userName: string;
  userEmail: string;
  region: string;
  activitySector: string;
  useCase: string;
  platformIdentifier: string;
  deploymentType: string;
}

export interface OrganizationPendingUserDigestUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface OrganizationPendingUserDigestModel {
  adminName: string;
  organizationName: string;
  users: OrganizationPendingUserDigestUser[];
  userCount: number;
  requestLabel: string;
}

export interface PlatformUnregisteredModel {
  adminName: string;
}
export const ServiceIdentifierToMailTemplate = new Map<
  ServiceDefinitionIdentifier,
  keyof MailTemplates
>([
  [ServiceDefinitionIdentifier.OpenaevScenarios, 'openaev_scenarios'],
  [
    ServiceDefinitionIdentifier.OpenctiCustomDashboards,
    'opencti_custom_dashboards',
  ],
  [ServiceDefinitionIdentifier.OpenctiIntegrations, 'opencti_integrations'],
  [ServiceDefinitionIdentifier.Vault, 'vault'],
]);
// ATTENTION, the key should be the same as the template file
export type MailTemplates = {
  welcome: WelcomeMailModel;
  vault: GenericServiceMailModel;
  opencti_custom_dashboards: GenericServiceMailModel;
  opencti_integrations: GenericServiceMailModel;
  openaev_scenarios: GenericServiceMailModel;
  new_user_organization: NewUserOrganizationMailModel;
  request_transfer_personal_space: RequestTransferPersonalSpaceMailModel;
  opencti_platform_registered: PlatformRegisteredModel;
  opencti_platform_unregistered: PlatformUnregisteredModel;
  openaev_platform_registered: PlatformRegisteredModel;
  openaev_platform_unregistered: PlatformUnregisteredModel;
  opencti_free_trial_registered: OpenCTIFreeTrialRegistered;
  opencti_free_trial_requested: OpenCTIFreeTrialGenericModel;
  opencti_free_trial_queued: OpenCTIFreeTrialGenericModel;
  opencti_free_trial_provisioning: OpenCTIFreeTrialGenericModel;
  opencti_free_trial_cancelled: OpenCTIFreeTrialGenericModel;
  opencti_free_trial_expired: OpenCTIFreeTrialGenericModel;
  organization_pending_user_digest: OrganizationPendingUserDigestModel;
  admin_saas_instance_requested: AdminSaasInstanceRequestedModel;
};

export const templateSubjects: {
  [K in keyof MailTemplates]: (params: MailTemplates[K]) => string;
} = {
  welcome: () => 'Welcome to XTM Hub – Let’s Get Started!',
  vault: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  opencti_custom_dashboards: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  opencti_integrations: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  openaev_scenarios: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  new_user_organization: (params: NewUserOrganizationMailModel) =>
    `XTM Hub - You've been added to the ${params.organizationName} organization`,
  request_transfer_personal_space: () =>
    `Confirmation of Personal Space Transfer in XTM Hub`,
  opencti_platform_registered: () =>
    `OpenCTI Platform Successfully Registered to XTM Hub – Integration Now Active`,
  opencti_platform_unregistered: () =>
    `OpenCTI Platform Successfully Unregistered from XTM Hub – Integration is Deactivated`,
  openaev_platform_registered: () =>
    `OpenAEV Platform Successfully Registered to XTM Hub – Integration Now Active`,
  openaev_platform_unregistered: () =>
    `OpenAEV Platform Successfully Unregistered from XTM Hub – Integration is Deactivated`,
  opencti_free_trial_registered: () => `Welcome to your OpenCTI free trial!`,
  opencti_free_trial_requested: () => `Your OpenCTI Free Trial Request`,
  opencti_free_trial_queued: () => `Your OpenCTI Free Trial Request`,
  opencti_free_trial_provisioning: () =>
    `Your OpenCTI Platform Is Being Provisioned`,
  opencti_free_trial_cancelled: () => 'Your OpenCTI Trial Has Been Cancelled',
  opencti_free_trial_expired: () => 'Your OpenCTI Free Trial Has Expired',
  organization_pending_user_digest: () =>
    'XTM Hub - Users Requesting to Join Your Organization',
  admin_saas_instance_requested: (params: AdminSaasInstanceRequestedModel) => {
    return `New ${params.platformIdentifier} SaaS ${params.deploymentType} Has Been Launched on XTM Hub by ${params.organizationName}`;
  },
};
