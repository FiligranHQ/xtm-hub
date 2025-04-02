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

// ATTENTION, the key should be the same as the template file
export type MailTemplates = {
  welcome: WelcomeMailModel;
  vault: GenericServiceMailModel;
  custom_dashboards: GenericServiceMailModel;
  new_user_organization: NewUserOrganizationMailModel;
};

export const templateSubjects: {
  [K in keyof MailTemplates]: (params: MailTemplates[K]) => string;
} = {
  welcome: () => 'Welcome to XTM Hub – Let’s Get Started!',
  vault: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  custom_dashboards: (params: GenericServiceMailModel) =>
    `XTM Hub - You've been invited to the ${params.serviceName}`,
  new_user_organization: (params: NewUserOrganizationMailModel) =>
    `XTM Hub - You've been added to the ${params.organizationName} organization`,
};
