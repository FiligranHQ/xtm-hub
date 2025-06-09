export enum RESTRICTION {
  CAPABILITY_BYPASS = 'BYPASS',
}

export enum OrganizationCapabilityName {
  ADMINISTRATE_ORGANIZATION = 'ADMINISTRATE_ORGANIZATION',
  MANAGE_ACCESS = 'MANAGE_ACCESS',
  MANAGE_SUBSCRIPTION = 'MANAGE_SUBSCRIPTION',
}

export const organizationCapabilitiesMultiSelectOptions = Object.values(
  OrganizationCapabilityName
).map((value) => ({
  label: value,
  value,
}));

export const DEBOUNCE_TIME = 300;
export const ANIMATION_TIME = 300;
