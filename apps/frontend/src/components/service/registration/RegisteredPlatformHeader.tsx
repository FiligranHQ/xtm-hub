'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { CONTRACT_LABEL_BY_CONTRACT } from '@/components/registration/PlatformIdentifierMapping';
import { ConnectedProductButtons } from '@/components/service/registration/ConnectedProductButtons';
import { useTranslate } from '@/hooks/use-translate';
import { isWithinLastMonths } from '@/utils/date';
import { Chip } from '@filigran/design-system';
import {
  PlatformContract,
  RegisteredPlatformDetailFragment,
} from '@graphql/generated';
import { useContext } from 'react';

interface RegisteredPlatformHeaderProps {
  registeredPlatform: RegisteredPlatformDetailFragment;
}

export const RegisteredPlatformHeader = ({
  registeredPlatform: platform,
}: RegisteredPlatformHeaderProps) => {
  const t = useTranslate();

  const { me } = useContext(PortalContext);
  const shouldDisplayHeaderButtons =
    me?.selected_organization_id === platform.subscription?.organization.id;
  const isConnectionStatusOk = isWithinLastMonths(
    new Date(platform.last_connectivity_check),
    1
  );

  return (
    <div className="flex flex-row">
      <div>
        <h1>{platform.title}</h1>
        <div className="flex gap-m">
          <Chip
            label={t(CONTRACT_LABEL_BY_CONTRACT[platform.contract])}
            severity={
              platform.contract === PlatformContract.Ee ? 'ee' : 'neutral'
            }
          />
          <Chip
            label={t(
              isConnectionStatusOk
                ? 'Register.Details.ConnectionStatus.Connected'
                : 'Register.Details.ConnectionStatus.NotConnected'
            )}
            severity={isConnectionStatusOk ? 'low' : 'critical'}
          />
        </div>
      </div>
      {shouldDisplayHeaderButtons && (
        <div className="ml-auto">
          <ConnectedProductButtons platform={platform} />
        </div>
      )}
    </div>
  );
};
