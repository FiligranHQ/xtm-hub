import ShareableResourceCard from '@/components/ui/shareable-resource/shareable-resource-card';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { PublicShareableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import React, { useMemo } from 'react';

interface Props {
  documents: PublicShareableResource[];
  serviceInstance: seoServiceInstanceFragment$data;
  baseUrl: string;
}

export const PublicShareableResourceList: React.FC<Props> = ({
  documents,
  serviceInstance,
  baseUrl,
}) => {
  if (documents.length === 0) {
    return <div className="my-4 text-center">No document found</div>;
  }

  const resourceCardList = useMemo(() => {
    return documents.map((document) => {
      return (
        <ShareableResourceCard
          publicPath
          key={document.id}
          document={document}
          serviceInstance={serviceInstance}
          detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
        />
      );
    });
  }, [documents]);

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-l">
      {resourceCardList}
    </ul>
  );
};
