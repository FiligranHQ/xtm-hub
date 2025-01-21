'use client';

import MeFilling from '@/components/me/me-filling';
import { MeContextFragment, MeQuery } from '@/components/me/me.graphql';
import { PortalContext } from '@/components/me/portal-context';
import UserEventSubscription from '@/components/me/user-event-subscription';
import * as React from 'react';
import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';
import { meContext_fragment$key } from '../../../__generated__/meContext_fragment.graphql';
import { meLoaderQuery } from '../../../__generated__/meLoaderQuery.graphql';

// Component interface
interface ContextProps {
  queryRef: PreloadedQuery<meLoaderQuery>;
  children: React.ReactNode;
}

// Component
const MeContext: React.FunctionComponent<ContextProps> = ({
  queryRef,
  children,
}) => {
  const data = usePreloadedQuery<meLoaderQuery>(MeQuery, queryRef);
  const me = useFragment<meContext_fragment$key>(MeContextFragment, data.me);

  return (
    <PortalContext me={me}>
      <UserEventSubscription />
      <MeFilling />

      {children}
    </PortalContext>
  );
};

// Component export
export default MeContext;
