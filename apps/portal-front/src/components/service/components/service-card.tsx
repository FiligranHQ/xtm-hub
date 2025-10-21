'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { IconActions, IconActionsItem } from '@/components/ui/icon-actions';
import ShareableResourceCard from '@/components/ui/shareable-resource/shareable-resource-card';
import ShareableResourceConnectorCard from '@/components/ui/shareable-resource/shareable-resource-connector-card';
import useServiceCapability from '@/hooks/useServiceCapability';
import {
  isConnectorResource,
  SubscribableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { MoreVertIcon } from 'filigran-icon';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface ServiceCardProps {
  document: SubscribableResource;
  detailUrl: string;
  shareLinkUrl: string;
}

const ServiceCard = ({
  document,
  detailUrl,
  shareLinkUrl,
}: ServiceCardProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const { serviceInstance } = useServiceContext();

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );

  if (isConnectorResource(document)) {
    return (
      <ShareableResourceConnectorCard
        integrationFeed={document}
        serviceInstance={serviceInstance}
      />
    );
  }

  return (
    <ShareableResourceCard
      key={document.id}
      document={document}
      detailUrl={detailUrl}
      shareLinkUrl={shareLinkUrl}
      serviceInstance={serviceInstance}
      extraContent={
        (userCanUpdate || userCanDelete) && (
          <>
            <IconActions
              className="z-[2]"
              icon={
                <>
                  <MoreVertIcon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{t('Utils.OpenMenu')}</span>
                </>
              }>
              <IconActionsItem onClick={() => setOpenSheet(true)}>
                {t('MenuActions.Update')}
              </IconActionsItem>
            </IconActions>
            <ServiceManageSheet
              document={document}
              open={openSheet}
              setOpen={setOpenSheet}
            />
          </>
        )
      }
    />
  );
};

export default ServiceCard;
