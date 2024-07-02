import { RESTRICTION } from '@/utils/constant';
import * as React from 'react';
import { createContext, FunctionComponent } from 'react';
import {
  meContext_fragment$data,
  Restriction,
} from '../../__generated__/meContext_fragment.graphql';

export interface Portal {
  me?: meContext_fragment$data | null;
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
