import {
  PlatformIdentifier,
  ServiceDefinitionIdentifier,
} from '../../../__generated__/resolvers-types';
import { MailTemplates } from '../../../server/mail-template/mail';

export const serviceDefinitionIdentifierMappedByPlatformIdentifier: Record<
  PlatformIdentifier,
  ServiceDefinitionIdentifier
> = {
  opencti: ServiceDefinitionIdentifier.OpenctiRegistration,
};

export const mailTemplateMappedByPlatformIdentifier: Record<
  PlatformIdentifier,
  keyof MailTemplates
> = {
  opencti: 'opencti_platform_registered',
};
