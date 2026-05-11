import { findDocumentLogo } from '@/utils/documents';
import { LogoFiligranIcon } from '@filigran/icon';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import Image from 'next/image';

interface ShareableResourceCardImageProps {
  document: documentItem_fragment$data | publicDocumentItemFragment$data;
  serviceInstanceId: string;
}
export const ShareableResourceCardImage = ({
  document,
  serviceInstanceId,
}: ShareableResourceCardImageProps) => {
  const logo = findDocumentLogo(document);

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
