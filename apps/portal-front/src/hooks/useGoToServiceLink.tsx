import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { APP_PATH } from '@/utils/path/constant';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { useRouter } from 'next/navigation';
import { useRelayEnvironment } from 'react-relay';

export const useGoToServiceLink = () => {
  const router = useRouter();

  return (serviceInstance: serviceList_fragment$data, id?: string) => {
    if (!serviceInstance.service_definition) {
      logFrontendError(useRelayEnvironment(), 'Service definition not found');
      return;
    }
    switch (serviceInstance.service_definition.identifier) {
      case 'link':
        const serviceLink = serviceInstance.links?.[0]?.url;
        if (serviceLink) {
          if (serviceLink.startsWith('http')) {
            window.open(serviceLink, '_blank', 'noopener,noreferrer');
            return;
          }
          router.push(serviceLink);
        }
        break;
      default:
        router.push(
          `/${APP_PATH}/service/${serviceInstance.service_definition.identifier}/${id}`
        );
        break;
    }
  };
};

export default useGoToServiceLink;
