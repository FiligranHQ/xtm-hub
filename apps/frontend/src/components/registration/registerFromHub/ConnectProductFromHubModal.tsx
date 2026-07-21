'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { DialogInformative } from '@/components/ui/Dialog';
import useGranted from '@/hooks/use-granted';
import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  OrganizationCapability,
  useConnectProductOrganizationAdminsQuery,
} from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

interface ConnectProductProps {
  isOpen: boolean;
  displayConnectedProductSentence?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const DEFAULT_EMAIL_BODY = () => `Hello,

I don't have the required permissions to connect our Filigran product to XTM Hub.

Could you please connect it by visiting https://hub.filigran.io/en, clicking "Connect product", and following the steps?

Once it's connected, please let me know.

Thank you!`;

const ConnectProductFromHubModal = ({
  isOpen,
  displayConnectedProductSentence = false,
  onOpenChange,
}: ConnectProductProps) => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const router = useRouter();
  const organizationId = me?.selected_organization_id ?? '';
  const canManageOrganization =
    useGranted(OrganizationCapability.AdministrateOrganization) ||
    useGranted(OrganizationCapability.ManagePlatformRegistration);
  const { data } = useConnectProductOrganizationAdminsQuery(
    portalGraphqlClient,
    {
      input: {
        organizationId,
        capabilities: [
          OrganizationCapability.ManagePlatformRegistration,
          OrganizationCapability.AdministrateOrganization,
        ],
      },
    },
    {
      enabled: isOpen && organizationId.length > 0,
    }
  );

  useEffect(() => {
    if (!me && isOpen) {
      router.push('/app');
    }
  }, [isOpen, me, router]);

  const allowedMessage = t('allowedMessage'); // TO Be done in the next chunk
  const deniedMessage = t('Register.ConnectFromHub.PermissionRequired');
  const notAllowedMessage = t('Register.ConnectFromHub.NotAllowedMessage', {
    count: data?.usersWithCapabilitiesInOrganization?.length ?? 0,
  });
  const deniedMessageDescription = displayConnectedProductSentence
    ? `${t('Register.ConnectFromHub.ConnectedProductSentence')}. \n\n ${notAllowedMessage}`
    : notAllowedMessage;
  const administratorsEmails =
    data?.usersWithCapabilitiesInOrganization?.map((user) => user.email) ?? [];
  const [mainRecipientEmail, ...ccRecipientsEmails] = administratorsEmails;

  const handleClose = () => {
    onOpenChange?.(false);
  };

  const handleReachAdmin = () => {
    const to = mainRecipientEmail;
    const params = [
      `subject=${encodeURIComponent(`Request to connect a product to XTM Hub`)}`,
      `body=${encodeURIComponent(DEFAULT_EMAIL_BODY())}`,
    ];
    if (ccRecipientsEmails.length > 0) {
      params.push(`cc=${encodeURIComponent(ccRecipientsEmails.join(','))}`);
    }
    window.location.href = `mailto:${to}?${params.join('&')}`;
  };

  return (
    <DialogInformative
      isOpen={isOpen}
      onClose={handleClose}
      onButtonClick={handleReachAdmin}
      variant={'default'}
      buttonText={'Register.ConnectFromHub.ReachAdmin'}
      title={canManageOrganization ? allowedMessage : deniedMessage}
      description={
        canManageOrganization ? allowedMessage : deniedMessageDescription
      }>
      <div className="space-y-1">
        <div className="content-body-base">
          {t('Register.ConnectFromHub.Administrators', {
            count: data?.usersWithCapabilitiesInOrganization?.length ?? 0,
          })}
          :
        </div>
        {data?.usersWithCapabilitiesInOrganization?.map((user) => {
          return (
            <div
              className="text-sm text-muted-foreground"
              key={user.email}>
              {user.email}
            </div>
          );
        })}
      </div>
    </DialogInformative>
  );
};

export default ConnectProductFromHubModal;
