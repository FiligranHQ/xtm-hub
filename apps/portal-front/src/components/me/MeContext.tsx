'use client';

import { MeContextFragment, MeQuery } from '@/components/me/me.graphql';
import { meContext_fragment$key } from '@generated/meContext_fragment.graphql';
import { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';
import ChatbotProvider from '../ariane/ChatbotProvider';
import { AppPortalContext } from './AppPortalContext';
import UserEventSubscription from './UserEventSubscription';

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
      <ChatbotProvider>{children}</ChatbotProvider>
    </AppPortalContext>
  );
};

// Component export
export default MeContext;
