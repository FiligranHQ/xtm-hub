'use client';

import { pageLoaderMeQuery } from '../../__generated__/pageLoaderMeQuery.graphql';
import * as React from 'react';
import {
  graphql,
  PreloadedQuery,
  useFragment,
  usePreloadedQuery,
} from 'react-relay';
import { MeQuery } from '../../app/(application)/page-loader';
import { PortalContext } from '@/components/portal-context';
import { meContext_fragment$key } from '../../__generated__/meContext_fragment.graphql';

// Context

// Relay
const MeContextFragment = graphql`
  fragment meContext_fragment on User {
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
interface ContextProps {
  queryRef: PreloadedQuery<pageLoaderMeQuery>;
  children: React.ReactNode;
}

// Component
const MeContext: React.FunctionComponent<ContextProps> = ({
  queryRef,
  children,
}) => {
  const data = usePreloadedQuery<pageLoaderMeQuery>(MeQuery, queryRef);
  const me = useFragment<meContext_fragment$key>(MeContextFragment, data.me);

  return <PortalContext me={me}>{children}</PortalContext>;
};

// Component export
export default MeContext;
