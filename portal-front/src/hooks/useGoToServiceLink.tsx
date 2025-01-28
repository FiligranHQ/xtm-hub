import { useRouter } from 'next/navigation';
import { serviceList_fragment$data } from '../../__generated__/serviceList_fragment.graphql';

export const useGoToServiceLink = () => {
  const router = useRouter();

  return (serviceInstance: serviceList_fragment$data, id?: string) => {
    switch (serviceInstance.service_definition?.identifier) {
      case 'link':
        const serviceLink = serviceInstance.links?.[0]?.url;
        if (serviceLink) {
          if (serviceLink.startsWith('http')) {
            window.open(serviceLink, '_blank');
            return;
          }
          router.push(serviceLink);
        }
        break;
      default:
        router.push(
          `/service/${serviceInstance.service_definition!.identifier}/${id}`
        );
        break;
    }
  };
};

export default useGoToServiceLink;
