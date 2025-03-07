import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { Carousel } from 'filigran-ui';
import * as React from 'react';

import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';

// Component interface
interface DashboardCarouselProps {
  documentData: documentItem_fragment$data;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const DashboardCarousel: React.FunctionComponent<DashboardCarouselProps> = ({
  documentData,
  serviceInstance,
}) => {
  const fileNames = (documentData.children_documents ?? [])?.map(
    ({ id }) => id
  );
  return (
    <Carousel
      placeholder={undefined}
      slides={
        fileNames.length > 0
          ? fileNames.map(
              (name) => `/document/visualize/${serviceInstance.id}/${name}`
            )
          : undefined
      }
    />
  );
};

export default DashboardCarousel;
