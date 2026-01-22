'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { ShareableResourceConnectorType } from '@/components/service/document/connector/shareable-resource-connector-slug-public';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { IconActions, IconActionsItem } from '@/components/ui/icon-actions';
import ShareableResourceCard from '@/components/ui/shareable-resource/shareable-resource-card';
import ShareableResourceConnectorCard from '@/components/ui/shareable-resource/shareable-resource-connector-card';
import useServiceCapability from '@/hooks/useServiceCapability';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import {
  isConnectorResource,
  isIntegrationItem,
  SubscribableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { MoreVertIcon } from '@filigran/icon';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useContext, useState } from 'react';

interface ServiceCardProps {
  document: SubscribableResource;
  detailUrl: string;
  shareLinkUrl: string;
  requiredProductVersion?: string;
}

const ServiceCard = ({
  document,
  detailUrl,
  shareLinkUrl,
}: ServiceCardProps) => {
  const { settings } = useContext(SettingsContext);
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const { serviceInstance, setIntegrationType } = useServiceContext();

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );

  const onClickOnUpdate = () => {
    if (document && isIntegrationItem(document)) {
      setIntegrationType(
        (document.integration_type as IntegrationTypeEnum) ??
          IntegrationTypeEnum.CSV_FEED
      );
    }

    setOpenSheet(true);
  };

  if (isConnectorResource(document)) {
    const docResource: ShareableResourceConnectorType = document;
    return (
      <ShareableResourceConnectorCard
        shareableConnector={docResource}
        requiredProductVersion={docResource.product_version}
        serviceInstance={serviceInstance}
        detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${docResource.id}`}
        shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${docResource?.service_instance?.slug}/${docResource?.slug}`}
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
              <IconActionsItem onClick={() => onClickOnUpdate()}>
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
