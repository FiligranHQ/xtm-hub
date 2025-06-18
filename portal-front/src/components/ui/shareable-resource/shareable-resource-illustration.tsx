'use client';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.utils';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Carousel, CarouselItem } from 'filigran-ui/clients';
import { AspectRatio } from 'filigran-ui/servers';
import Image from 'next/image';
import Link from 'next/link';
import ShareableResourceBento from './shareable-resource-bento';

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

  const ShareableResourceCarousel = () => (
    <Carousel
      scrollButton="hover"
      dotButton="hover"
      className="h-full p-s">
      <CarouselItem
        className="cursor-pointer"
        onClick={handleClickCarousel}>
        <ShareableResourceBento
          document={document}
          serviceInstanceId={serviceInstance.id}
          className="-mx-s"
        />
      </CarouselItem>
      {document.children_documents!.map((doc) => (
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
  );

  return (
    <div>
      <AspectRatio
        ratio={16 / 9}
        className={'z-[10]'}>
        {(document.children_documents &&
          document.children_documents.length > 1 && (
            <ShareableResourceCarousel />
          )) || (
          <div className="relative h-full p-s">
            <Link href={detailUrl}>
              <ShareableResourceBento
                document={document}
                serviceInstanceId={serviceInstance.id}
              />
            </Link>
          </div>
        )}
      </AspectRatio>
    </div>
  );
};

export default ShareableResourceCardIllustration;
