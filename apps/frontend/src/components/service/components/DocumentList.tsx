import ServiceCard from '@/components/service/components/ServiceCard';
import { useServiceContext } from '@/components/service/components/ServiceContext';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { useContext } from 'react';

interface DocumentListProps {
  documents: documentItem_fragment$data[];
}

const DocumentList = ({ documents }: DocumentListProps) => {
  const { settings } = useContext(SettingsContext);
  const { serviceInstance } = useServiceContext();

  return (
    <ul
      className={
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
      }>
      {documents.map((document) => (
        <ServiceCard
          key={document.id}
          document={document}
          detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${document.id}`}
          shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
        />
      ))}
    </ul>
  );
};

export default DocumentList;
