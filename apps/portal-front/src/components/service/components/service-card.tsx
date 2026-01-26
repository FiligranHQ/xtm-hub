'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { useServiceContext } from '@/components/service/components/service-context';
import {
  CardTypeEnum,
  ServiceDelete,
} from '@/components/service/components/service-delete';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import { IconActions, IconActionsItem } from '@/components/ui/icon-actions';
import ShareableResourceCard from '@/components/ui/shareable-resource/shareable-resource-card';
import useServiceCapability from '@/hooks/useServiceCapability';
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import {
  isIntegrationItem,
  ShareableResourceType,
  SubscribableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { MoreVertIcon } from '@filigran/icon';
import { toast } from '@filigran/ui';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ServiceCardProps {
  document: SubscribableResource;
  detailUrl: string;
  shareLinkUrl: string;
  requiredProductVersion?: string;
  connectionId?: string;
}

const ServiceCard = ({
  document,
  detailUrl,
  shareLinkUrl,
  connectionId,
}: ServiceCardProps) => {
  const t = useTranslations();
  const router = useRouter();

  const [openSheet, setOpenSheet] = useState(false);

  const { serviceInstance, setIntegrationType, translationKey } =
    useServiceContext();
  const context = useDocumentContext({
    serviceInstance,
    connectionId,
    type: document.type as ShareableResourceType,
  });
  const hasUploadCapability = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );
  const isAllowedIntegration =
    isIntegrationItem(document) &&
    document.integration_type !== IntegrationTypeEnum.CONNECTOR;
  const isAllowedType =
    document.type !== ShareableResourceType.OPENCTI_INTEGRATION;

  const userCanUpdate =
    hasUploadCapability && (isAllowedIntegration || isAllowedType);

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

  function onDeleteCompleted() {
    revalidatePathActions([
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    ]).then(() => {
      router.push(
        `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`
      );
    });
    toast({
      title: t('Utils.Success'),
      description: t(`${translationKey}.Actions.Deleted`, {
        name: document?.name ?? '',
      }),
    });
  }
  return (
    <ShareableResourceCard
      key={document.id}
      document={document}
      detailUrl={detailUrl}
      shareLinkUrl={shareLinkUrl}
      serviceInstance={serviceInstance}
      extraContent={
        <>
          <IconActions
            className="z-[2]"
            icon={
              <>
                <MoreVertIcon className="h-4 w-4 text-primary" />
                <span className="sr-only">{t('Utils.OpenMenu')}</span>
              </>
            }>
            {userCanUpdate && (
              <IconActionsItem onClick={() => onClickOnUpdate()}>
                {t('MenuActions.Update')}
              </IconActionsItem>
            )}
            {userCanDelete && (
              <ServiceDelete
                type={'menuitem'}
                userCanDelete={userCanDelete}
                onDelete={() =>
                  context.handleDeleteSheet(document, onDeleteCompleted)
                }
                serviceName={serviceInstance.name}
                integrationType={
                  (document && isIntegrationItem(document)
                    ? document.integration_type
                    : document.type) as CardTypeEnum
                }
              />
            )}
          </IconActions>
          {userCanUpdate && (
            <ServiceManageSheet
              document={document}
              open={openSheet}
              setOpen={setOpenSheet}
            />
          )}
        </>
      }
    />
  );
};

export default ServiceCard;
