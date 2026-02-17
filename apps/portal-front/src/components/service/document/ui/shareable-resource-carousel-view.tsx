'use client';
import { Carousel, CarouselItem, DialogContent } from '@filigran/ui/clients';
import * as React from 'react';
import { useState } from 'react';

import { Dialog } from '@filigran/ui';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import Image from 'next/image';

// Component interface
interface ShareableResourceCarouselProps {
  documentData: documentItem_fragment$data;
  serviceInstance:
    | seoServiceInstanceFragment$data
    | serviceInstance_fragment$data;
}

const ShareableResourceCarousel: React.FunctionComponent<
  ShareableResourceCarouselProps
> = ({ documentData, serviceInstance }) => {
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
    <>
      {fileNames.length > 0 && (
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
      )}
    </>
  );
};

export default ShareableResourceCarousel;
