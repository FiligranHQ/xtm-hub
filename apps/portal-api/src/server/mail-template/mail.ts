import {
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../__generated__/resolvers-types';

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
  platformIdentifier: PlatformIdentifier;
}
export interface FreeTrialRegistered {
  firstName: string;
  platformUrl: string;
  platformIdentifier: PlatformIdentifier;
}
export interface FreeTrialGenericModel {
  firstName: string;
  platformIdentifier: PlatformIdentifier;
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
  platformIdentifier: PlatformIdentifier;
}

export const PlatformIdentifierToString: Record<PlatformIdentifier, string> = {
  [PlatformIdentifier.Opencti]: 'OpenCTI',
  [PlatformIdentifier.Openaev]: 'OpenAEV',
};

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
  platform_registered: PlatformRegisteredModel;
  platform_unregistered: PlatformUnregisteredModel;
  free_trial_registered: FreeTrialRegistered;
  free_trial_requested: FreeTrialGenericModel;
  free_trial_queued: FreeTrialGenericModel;
  free_trial_provisioning: FreeTrialGenericModel;
  free_trial_cancelled: FreeTrialGenericModel;
  free_trial_expired: FreeTrialGenericModel;
  organization_pending_user_digest: OrganizationPendingUserDigestModel;
  admin_saas_instance_requested: AdminSaasInstanceRequestedModel;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  public_roadmap_monthly_reminder: {};
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
  platform_registered: (params: PlatformRegisteredModel) =>
    `${
      PlatformIdentifierToString[params.platformIdentifier]
    } Platform Successfully Registered to XTM Hub – Integration Now Active`,
  platform_unregistered: (params: PlatformUnregisteredModel) =>
    `${
      PlatformIdentifierToString[params.platformIdentifier]
    } Platform Successfully Unregistered from XTM Hub – Integration is Deactivated`,
  free_trial_registered: (params: FreeTrialGenericModel) =>
    `Welcome to your ${
      PlatformIdentifierToString[params.platformIdentifier]
    } free trial!`,
  free_trial_requested: (params: FreeTrialGenericModel) =>
    `Your ${
      PlatformIdentifierToString[params.platformIdentifier]
    } Free Trial Request`,
  free_trial_queued: (params: FreeTrialGenericModel) =>
    `Your ${
      PlatformIdentifierToString[params.platformIdentifier]
    } Free Trial Request`,
  free_trial_provisioning: (params: FreeTrialGenericModel) =>
    `Your ${
      PlatformIdentifierToString[params.platformIdentifier]
    } Platform Is Being Provisioned`,
  free_trial_cancelled: (params: FreeTrialGenericModel) =>
    `Your ${PlatformIdentifierToString[params.platformIdentifier]} Trial Has Been Cancelled`,
  free_trial_expired: (params: FreeTrialGenericModel) =>
    `Your ${PlatformIdentifierToString[params.platformIdentifier]} Free Trial Has Expired`,
  organization_pending_user_digest: () =>
    'XTM Hub - Users Requesting to Join Your Organization',
  admin_saas_instance_requested: (params: AdminSaasInstanceRequestedModel) => {
    return `New ${params.platformIdentifier} SaaS ${params.deploymentType} Has Been Launched on XTM Hub by ${params.organizationName}`;
  },
  public_roadmap_monthly_reminder: () =>
    'XTM Hub - Public Roadmap monthly reminder',
};
