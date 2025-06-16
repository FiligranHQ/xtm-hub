'use client';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.utils';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Carousel, CarouselItem } from 'filigran-ui/clients';
import { AspectRatio } from 'filigran-ui/servers';
import Image from 'next/image';
import DocumentBento from './document-bento';

interface ShareableResourceCardIllustrationProps {
  document: ShareableResource;
  detailUrl: string;
  serviceInstance:
    | NonNullable<serviceByIdQuery$data['serviceInstanceById']>
    | seoServiceInstanceFragment$data;
}

const ShareableResourceCardIllustration = ({
  document,
  detailUrl,
  serviceInstance,
}: ShareableResourceCardIllustrationProps) => {
  const handleClickCarousel = () => (window.location.href = detailUrl);

  return (
    <div>
      <AspectRatio
        ratio={16 / 9}
        className={'z-[10]'}>
        {(document.children_documents &&
          document.children_documents.length > 1 && (
            <Carousel
              scrollButton="hover"
              dotButton="hover"
              className="h-full p-s">
              <CarouselItem
                className="cursor-pointer"
                onClick={handleClickCarousel}>
                <DocumentBento
                  document={document}
                  serviceInstanceId={serviceInstance.id}
                />
              </CarouselItem>
              {document.children_documents.map((doc) => (
                <CarouselItem
                  key={doc.id}
                  className="cursor-pointer"
                  onClick={handleClickCarousel}>
                  <Image
                    fill
                    objectPosition="top"
                    objectFit="cover"
                    src={`/document/images/${serviceInstance.id}/${doc.id}`}
                    alt={`An image of ${document.name}`}
                  />
                </CarouselItem>
              ))}
            </Carousel>
          )) || (
          <DocumentBento
            document={document}
            serviceInstanceId={serviceInstance.id}
          />
        )}
      </AspectRatio>
    </div>
  );
};

export default ShareableResourceCardIllustration;
