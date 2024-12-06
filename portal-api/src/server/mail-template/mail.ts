export interface PartnerVaultMailModel {
  name: string;
  partnerVaultLink: string;
  partnerVault: string;
}
export type WelcomeMailModel = object;

// ATTENTION, the key should be the same as the template file
export type MailTemplates = {
  welcome: WelcomeMailModel;
  partnerVault: PartnerVaultMailModel;
};

export const templateSubjects: {
  [K in keyof MailTemplates]: (params: MailTemplates[K]) => string;
} = {
  welcome: () => 'Welcome to XTM Hub – Let’s Get Started!',
  partnerVault: (params: PartnerVaultMailModel) =>
    `XTM Hub - Welcome to Your ${params.partnerVault}`,
};
