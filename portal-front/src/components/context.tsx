'use client';

import { pageLoaderMeQuery } from '../../__generated__/pageLoaderMeQuery.graphql';
import * as React from 'react';
import { createContext } from 'react';
import {
  graphql,
  PreloadedQuery,
  useFragment,
  useLazyLoadQuery,
  usePreloadedQuery,
} from 'react-relay';
import {
  context_fragment$data,
  context_fragment$key,
  Restriction,
} from '../../__generated__/context_fragment.graphql';

import { CAPABILITY_BYPASS } from '@/utils/constant';
import { MeQuery } from '../../app/(application)/page-loader';
import {
  rolePortalQuery,
  rolePortalQuery$data,
} from '../../__generated__/rolePortalQuery.graphql';
import { rolePortalFetch } from '@/components/organization/role.graphql';

// Context
export interface Portal {
  me?: context_fragment$data | null;
  rolePortal?: rolePortalQuery$data | null;
  hasCapability?: (capability: Restriction) => boolean;
}

export const portalContext = createContext<Portal>({});

const generatePortalContext = (
  me: context_fragment$data | null | undefined,
  rolePortal?: rolePortalQuery$data | null | undefined
): Portal => {
  return {
    me,
    rolePortal,
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
    roles_portal_id {
      id
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
  const rolePortalData = useLazyLoadQuery<rolePortalQuery>(rolePortalFetch, {});

  return (
    <portalContext.Provider value={generatePortalContext(me, rolePortalData)}>
      {children}
    </portalContext.Provider>
  );
};

// Component export
export default PortalContext;
