import ShareableResourceCard from '@/components/ui/shareable-resource/ShareableResourceCard';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { publicDocumentListItemFragment$data } from '@generated/publicDocumentListItemFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { useLocale } from 'next-intl';

interface PublicShareableDocumentListProps {
  documents: publicDocumentListItemFragment$data[];
  serviceInstance: seoServiceInstanceFragment$data;
  baseUrl: string;
}

export const PublicShareableDocumentList = ({
  documents,
  serviceInstance,
  baseUrl,
}: PublicShareableDocumentListProps) => {
  const locale = useLocale();

  return (
    <ul
      className={
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
      }>
      {documents.map((document) => (
        <ShareableResourceCard
          publicPath
          key={document.id}
          document={document}
          serviceInstance={serviceInstance}
          detailUrl={`/${locale}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
        />
      ))}
    </ul>
  );
};
