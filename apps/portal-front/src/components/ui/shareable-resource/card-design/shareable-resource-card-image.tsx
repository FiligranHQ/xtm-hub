import { LogoFiligranIcon } from '@filigran/icon';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentImageTypeEnum } from '@generated/models/DocumentImageType.enum';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import Image from 'next/image';
import { FunctionComponent } from 'react';

interface ShareableResourceCardImageProps {
  document: documentItem_fragment$data | publicDocumentItemFragment$data;
  serviceInstanceId: string;
}
export const ShareableResourceCardImage: FunctionComponent<
  ShareableResourceCardImageProps
> = ({ document, serviceInstanceId }) => {
  const logo = document.children_documents?.find(
    (doc) => doc.image_type === DocumentImageTypeEnum.LOGO
  );

  return (
    <>
      <div className=" items-center self-stretch flex">
        {logo ? (
          <Image
            src={`/document/images/${serviceInstanceId}/${logo.id}`}
            alt={`${document.name} logo`}
            width={96}
            height={96}
            style={{ minHeight: '96px' }}
            loading="lazy"
            className="rounded object-contain"
          />
        ) : (
          <div className="w-24 p-m border border-light">
            <LogoFiligranIcon className="size-18" />
          </div>
        )}
      </div>
    </>
  );
};
