import { PLATFORM_ORGANIZATION_UUID } from '@/utils/constant';
import { hasResourceLogo } from '@/utils/shareable-resources/shareable-resources.types';
import { LogoFiligranIcon } from '@filigran/icon';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
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
  return (
    <>
      <div className=" items-center self-stretch flex">
        {document?.uploader_organization?.id !== PLATFORM_ORGANIZATION_UUID &&
        document?.children_documents?.length &&
        hasResourceLogo(document) ? (
          <Image
            src={`/document/images/${serviceInstanceId}/${document.children_documents?.[0]?.id}`}
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
