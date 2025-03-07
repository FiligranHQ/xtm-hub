'use client';

import { AppPortalContext } from '@/components/me/app-portal-context';
import { MeContextFragment, MeQuery } from '@/components/me/me.graphql';
import UserEventSubscription from '@/components/me/user-event-subscription';
import { meContext_fragment$key } from '@generated/meContext_fragment.graphql';
import { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import * as React from 'react';
import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';

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
    <AppPortalContext me={me}>
      <UserEventSubscription />
      {children}
    </AppPortalContext>
  );
};

// Component export
export default MeContext;
