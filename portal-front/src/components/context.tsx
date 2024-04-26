'use client';

import { pageLoaderMeQuery } from '../../__generated__/pageLoaderMeQuery.graphql';
import * as React from 'react';
import { createContext } from 'react';
import { graphql, PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';
import {
  context_fragment$data,
  context_fragment$key,
  Restriction,
} from '../../__generated__/context_fragment.graphql';
import { CAPABILITY_BYPASS } from '@/utils/constant';
import { MeQuery } from '../../app/(application)/page-loader';

// Context
export interface Portal {
  me?: context_fragment$data | null;
  hasCapability?: (capability: Restriction) => boolean;
}

export const portalContext = createContext<Portal>({});

const generatePortalContext = (
  me: context_fragment$data | null | undefined
): Portal => {
  return {
    me,
    hasCapability: (capability: Restriction) => {
      const userCapabilities = (me?.capabilities ?? []).map((c) => c?.name);
      return (
        userCapabilities.includes(CAPABILITY_BYPASS) ||
        userCapabilities.includes(capability)
      );
    },
  };
};

// Relay
const ContextFragment = graphql`
  fragment context_fragment on User {
    id
    email
    capabilities {
      name
    }
  }
`;

// Component interface
interface PortalContextProps {
  queryRef: PreloadedQuery<pageLoaderMeQuery>;
  children: React.ReactNode;
}

// Component
const PortalContext: React.FunctionComponent<PortalContextProps> = ({
  queryRef,
  children,
}) => {
  const data = usePreloadedQuery<pageLoaderMeQuery>(MeQuery, queryRef);
  const me = useFragment<context_fragment$key>(ContextFragment, data.me);

  return (
    <portalContext.Provider value={generatePortalContext(me)}>
      {children}
    </portalContext.Provider>
  );
};

// Component export
export default PortalContext;
