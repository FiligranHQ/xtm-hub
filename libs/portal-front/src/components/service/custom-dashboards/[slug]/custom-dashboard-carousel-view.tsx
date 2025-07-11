'use client';
import { Carousel, CarouselItem, DialogContent } from 'filigran-ui/clients';
import * as React from 'react';

import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Dialog } from 'filigran-ui';
import Image from 'next/image';
import { useState } from 'react';

// Component interface
interface DashboardCarouselProps {
  documentData: customDashboardsItem_fragment$data;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const DashboardCarousel: React.FunctionComponent<DashboardCarouselProps> = ({
  documentData,
  serviceInstance,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [pictureIndex, setPictureIndex] = useState<number>(0);
  const fileNames = (documentData.children_documents ?? []).map(
    (doc) => doc?.id
  );
  const handleCarouselImageClick = (open: boolean, index: number) => {
    setOpen(open);
    setPictureIndex(index);
  };
  return (
    <Carousel className="h-[35vh]">
      {fileNames.map((name, index) => (
        <CarouselItem
          key={name}
          className="cursor-pointer"
          onClick={() => handleCarouselImageClick(true, index)}>
          <Image
            fill
            objectFit="cover"
            objectPosition="top"
            src={`/document/images/${serviceInstance.id}/${name}`}
            alt={`A picture of ${name}`}
          />
        </CarouselItem>
      ))}
      <Dialog
        open={open}
        onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh)] h-screen w-screen max-w-[calc(100dvw)] ">
          <Carousel
            opts={{
              startIndex: pictureIndex,
            }}>
            {fileNames.map((name) => (
              <CarouselItem key={name}>
                <Image
                  fill
                  objectFit="contain"
                  src={`/document/images/${serviceInstance.id}/${name}`}
                  alt={`A picture of ${name}`}
                />
              </CarouselItem>
            ))}
          </Carousel>
        </DialogContent>
      </Dialog>
    </Carousel>
  );
};

export default DashboardCarousel;
