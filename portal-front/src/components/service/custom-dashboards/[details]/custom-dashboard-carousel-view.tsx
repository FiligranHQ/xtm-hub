import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { Carousel } from 'filigran-ui';
import * as React from 'react';
import { useState } from 'react';

import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';

// Component interface
interface DashboardCarouselProps {
  documentData: documentItem_fragment$data;
  serviceInstance: serviceByIdQuery$data;
}

const DashboardCarousel: React.FunctionComponent<DashboardCarouselProps> = ({
  documentData,
  serviceInstance,
}) => {
  const [selectedIndexCarousel, setSelectedIndexCarousel] = useState(0);
  const fileNames = (documentData.children_documents ?? [])?.map(
    ({ id }) => id
  );
  return (
    <>
      <Carousel
        placeholder={undefined}
        onSlideChange={(slideIndex) => setSelectedIndexCarousel(slideIndex)}
        slides={
          fileNames.length > 0
            ? fileNames.map(
                (fn) => `/document/visualize/${documentData.id}/${fn}`
              )
            : undefined
        }
      />
      <div className="flex justify-center mt-l">
        <div
          className="mr-xl w-32 h-32"
          style={{
            backgroundImage: `url(/document/visualize/${serviceInstance.serviceInstanceById?.id}/${documentData.children_documents?.[selectedIndexCarousel - 1]?.id})`,
            backgroundSize: 'cover',
          }}
        />

        <div
          className="mr-xl w-32 h-32"
          style={{
            backgroundImage: `url(/document/visualize/${serviceInstance.serviceInstanceById?.id}/${documentData.children_documents?.[selectedIndexCarousel]?.id})`,
            backgroundSize: 'cover',
          }}
        />
        <div
          className="ml-xl w-32 h-32"
          style={{
            backgroundImage: `url(/document/visualize/${serviceInstance.serviceInstanceById?.id}/${documentData.children_documents?.[selectedIndexCarousel + 1]?.id})`,
            backgroundSize: 'cover',
          }}
        />
      </div>
    </>
  );
};

export default DashboardCarousel;
