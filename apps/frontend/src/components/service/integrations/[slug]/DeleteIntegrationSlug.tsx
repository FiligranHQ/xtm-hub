import { useServiceContext } from '@/components/service/components/ServiceContext';

import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';

import {
  CardTypeEnum,
  ServiceDelete,
} from '@/components/service/components/ServiceDelete';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import useServiceCapability from '@/hooks/use-service-capability';
import revalidatePathActions from '@/utils/actions/revalidate-path.actions';
import {
  isIntegrationItem,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { toast } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { ServiceRestrictionEnum } from '@generated/models/ServiceRestriction.enum';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

// Component interface
interface DeleteIntegrationSlugProps {
  document: documentItem_fragment$data;
}

// Component
const DeleteIntegrationSlug = ({ document }: DeleteIntegrationSlugProps) => {
  const router = useRouter();
  const t = useTranslations();

  const serviceContext = useServiceContext();

  const context = useDocumentContext({
    serviceInstance: serviceContext.serviceInstance,
    connectionId: '',
    type: ShareableResourceType.OPENCTI_INTEGRATION,
  });
  const userCanDelete = useServiceCapability(
    ServiceRestrictionEnum.DELETE,
    serviceContext.serviceInstance
  );

  function onDeleteCompleted() {
    revalidatePathActions([
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceContext.serviceInstance.slug}`,
    ]).then(() => {
      router.push(
        `/${APP_PATH}/service/${serviceContext.serviceInstance.service_definition!.identifier}/${serviceContext.serviceInstance.id}`
      );
    });
    toast({
      title: t('Utils.Success'),
      description: t(`${serviceContext.translationKey}.Actions.Deleted`, {
        name: document.name ?? '',
      }),
    });
  }

  return (
    <ServiceDelete
      userCanDelete={userCanDelete}
      onDelete={() => context.handleDeleteSheet(document, onDeleteCompleted)}
      serviceName={serviceContext.serviceInstance.name}
      integrationType={
        (document && isIntegrationItem(document)
          ? document.integration_type
          : document.type) as CardTypeEnum
      }
    />
  );
};

// Component export
export default DeleteIntegrationSlug;
