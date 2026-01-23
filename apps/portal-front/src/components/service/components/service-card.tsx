'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceDelete } from '@/components/service/components/service-delete';
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

  const { serviceInstance, setIntegrationType } = useServiceContext();
  const context = useDocumentContext({
    serviceInstance,
    connectionId,
    type: ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
  });
  const serviceContext = useServiceContext();

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

  function onDeleteCompleted() {
    revalidatePathActions([
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    ]).then(() => {
      router.push(
        `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`
      );
    });
    setOpenSheet(false);
    toast({
      title: t('Utils.Success'),
      description: t(`${serviceContext.translationKey}.Actions.Deleted`, {
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
              <ServiceDelete
                userCanDelete={userCanDelete}
                onDelete={() =>
                  context.handleDeleteSheet(document, onDeleteCompleted)
                }
                serviceName={serviceContext.serviceInstance.name}
                translationKey={serviceContext.translationKey}
              />
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
