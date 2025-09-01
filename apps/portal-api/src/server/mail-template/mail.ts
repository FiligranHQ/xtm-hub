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

export interface PlatformRegisteredModel {
  adminName: string;
}

export interface PlatformUnregisteredModel {
  adminName: string;
}

// ATTENTION, the key should be the same as the template file
export type MailTemplates = {
  welcome: WelcomeMailModel;
  vault: GenericServiceMailModel;
  custom_dashboards: GenericServiceMailModel;
  csv_feeds: GenericServiceMailModel;
  openaev_scenarios: GenericServiceMailModel;
  new_user_organization: NewUserOrganizationMailModel;
  opencti_platform_registered: PlatformRegisteredModel;
  opencti_platform_unregistered: PlatformUnregisteredModel;
};

export const templateSubjects: {
  [K in keyof MailTemplates]: (params: MailTemplates[K]) => string;
} = {
  welcome: () => 'Welcome to XTM Hub – Let’s Get Started!',
  vault: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  custom_dashboards: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  csv_feeds: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  openaev_scenarios: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  new_user_organization: (params: NewUserOrganizationMailModel) =>
    `XTM Hub - You've been added to the ${params.organizationName} organization`,
  opencti_platform_registered: () =>
    `OpenCTI Platform Successfully Registered to XTM Hub – Integration Now Active`,
  opencti_platform_unregistered: () =>
    `OpenCTI Platform Successfully Unregistered from XTM Hub – Integration is Deactivated`,
};
