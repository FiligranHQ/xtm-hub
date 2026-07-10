import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { OrganizationCapability, PlatformIdentifier } from '@graphql/generated';
import * as React from 'react';
import { createContext } from 'react';

export interface RegistrationState {
  identifier?: PlatformIdentifier;
  displayedIdentifier: string;
  capability?: OrganizationCapability;
}

export interface RegistrationProps {
  identifier?: PlatformIdentifier;
  children: React.ReactNode;
}

export const RegistrationContext = createContext<RegistrationState>({
  displayedIdentifier: '',
});

export const generateRegistrationContext = (
  identifier?: PlatformIdentifier
): RegistrationState => {
  if (!identifier) {
    return { displayedIdentifier: '' };
  }

  const displayedIdentifier = PlatformMetadataMapping[identifier].name;

  return {
    identifier,
    displayedIdentifier,
    capability: OrganizationCapability.ManagePlatformRegistration,
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
