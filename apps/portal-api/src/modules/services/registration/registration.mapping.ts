import {
  OrganizationCapability,
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { MailTemplates } from '../../../server/mail-template/mail';

export const serviceDefinitionIdentifierMappedByPlatformIdentifier: Record<
  PlatformIdentifier,
  ServiceDefinitionIdentifier
> = {
  [PlatformIdentifier.Opencti]: ServiceDefinitionIdentifier.OpenctiRegistration,
};

export const registeredMailTemplateMappedByPlatformIdentifier: Record<
  PlatformIdentifier,
  keyof MailTemplates
> = {
  [PlatformIdentifier.Opencti]: 'opencti_platform_registered',
};

export const unregisteredMailTemplateMappedByPlatformIdentifier: Record<
  PlatformIdentifier,
  keyof MailTemplates
> = {
  [PlatformIdentifier.Opencti]: 'opencti_platform_unregistered',
};

export const platformIdentifierMappedByServiceDefinitionIdentifier: Partial<
  Record<ServiceDefinitionIdentifier, PlatformIdentifier>
> = {
  [ServiceDefinitionIdentifier.OpenctiRegistration]: PlatformIdentifier.Opencti,
};

export const organizationCapabilityMappedByPlatformIdentifier: Record<
  PlatformIdentifier,
  OrganizationCapability
> = {
  opencti: OrganizationCapability.ManageOpenctiRegistration,
};

export const serviceInstanceNameMappedByPlatformIdentifier: Record<
  PlatformIdentifier,
  string
> = {
  [PlatformIdentifier.Opencti]: 'OpenCTI Platform',
};

export const serviceInstanceTagMappedByPlatformIdentifier: Record<
  PlatformIdentifier,
  string
> = {
  [PlatformIdentifier.Opencti]: 'openCTI',
};
