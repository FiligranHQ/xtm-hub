import { RESTRICTION } from '@/utils/constant';
import {
  meContext_fragment$data,
  Restriction,
} from '@generated/meContext_fragment.graphql';
import * as React from 'react';
import { createContext, FunctionComponent } from 'react';

export interface Portal {
  me?: meContext_fragment$data | null;
  isPersonalSpace?: boolean;
  hasCapability?: (capability: Restriction) => boolean;
}

export interface PortalProps extends Portal {
  children: React.ReactNode;
}

export const portalContext = createContext<Portal>({});

export const generatePortalContext = (
  me: meContext_fragment$data | null | undefined
): Portal => {
  return {
    me,
    isPersonalSpace:
      me?.organizations?.some(
        (org) => org.personal_space && org.id === me?.selected_organization_id
      ) ?? false,
    hasCapability: (capability: Restriction) => {
      const userCapabilities = (me?.capabilities ?? []).map((c) => c?.name);
      return (
        userCapabilities.includes(RESTRICTION.CAPABILITY_BYPASS) ||
        userCapabilities.includes(capability)
      );
    },
  };
};

export const PortalContext: FunctionComponent<PortalProps> = ({
  children,
  me,
}) => {
  return (
    <portalContext.Provider value={generatePortalContext(me)}>
      {children}
    </portalContext.Provider>
  );
};
