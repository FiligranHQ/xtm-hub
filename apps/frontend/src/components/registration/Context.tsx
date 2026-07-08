import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import * as React from 'react';
import { createContext } from 'react';

export interface RegistrationState {
  identifier?: PlatformIdentifierEnum;
  displayedIdentifier: string;
  capability?: OrganizationCapabilityEnum;
}

export interface RegistrationProps {
  identifier?: PlatformIdentifierEnum;
  children: React.ReactNode;
}

export const RegistrationContext = createContext<RegistrationState>({
  displayedIdentifier: '',
});

export const generateRegistrationContext = (
  identifier?: PlatformIdentifierEnum
): RegistrationState => {
  if (!identifier) {
    return { displayedIdentifier: '' };
  }

  const displayedIdentifier = PlatformMetadataMapping[identifier].name;

  return {
    identifier,
    displayedIdentifier,
    capability: OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
  };
};

export const RegistrationContextProvider = ({
  children,
  identifier,
}: RegistrationProps) => {
  return (
    <RegistrationContext.Provider
      value={generateRegistrationContext(identifier)}>
      {children}
    </RegistrationContext.Provider>
  );
};
