'use client';

import { AppPortalContext } from '@/components/me/app-portal-context';
import { MeContextFragment, MeQuery } from '@/components/me/me.graphql';
import UserEventSubscription from '@/components/me/user-event-subscription';
import { meContext_fragment$key } from '@generated/meContext_fragment.graphql';
import { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';
import Copilot from '../external/copilot';
import { useContext } from 'react';
import { SettingsContext } from '@/components/settings/env-portal-context';

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
  const { settings } = useContext(SettingsContext);
  const isProductionSetting =
    settings?.environment && settings.environment === 'production';
  return (
    <AppPortalContext me={me}>
      <UserEventSubscription />
      {isProductionSetting && <Copilot user={me} />}
      {children}
    </AppPortalContext>
  );
};

// Component export
export default MeContext;
