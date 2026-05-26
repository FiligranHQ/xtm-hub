'use client';

import Copilot from '@/components/external/Copilot';
import { AppPortalContext } from '@/components/me/AppPortalContext';
import { MeContextFragment, MeQuery } from '@/components/me/me.graphql';
import UserEventSubscription from '@/components/me/UserEventSubscription';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import { meContext_fragment$key } from '@generated/meContext_fragment.graphql';
import { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import { useContext } from 'react';
import { PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';

// Component interface
interface ContextProps {
  queryRef: PreloadedQuery<meLoaderQuery>;
  children: React.ReactNode;
}

// Component
const MeContext = ({ queryRef, children }: ContextProps) => {
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
