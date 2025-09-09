import {
  RegistrationCapabilityMapping,
  RegistrationTranslationMapping,
} from '@/components/registration/platform-identifier-mapping';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import * as React from 'react';
import { createContext, FunctionComponent } from 'react';

export interface RegistrationState {
  identifier?: PlatformIdentifierEnum;
  displayedIdentifier?: string;
  capability?: OrganizationCapabilityEnum;
}

export interface RegistrationProps extends RegistrationState {
  children: React.ReactNode;
}

export const RegistrationContext = createContext<RegistrationState>({});

export const generateRegistrationContext = (
  identifier?: PlatformIdentifierEnum
): RegistrationState => {
  if (!identifier) {
    return {};
  }

  const displayedIdentifier = RegistrationTranslationMapping[identifier];
  const capability = RegistrationCapabilityMapping[identifier];

  return { identifier, displayedIdentifier, capability };
};

export const RegistrationContextProvider: FunctionComponent<
  RegistrationProps
> = ({ children, identifier }) => {
  return (
    <RegistrationContext.Provider
      value={generateRegistrationContext(identifier)}>
      {children}
    </RegistrationContext.Provider>
  );
};
