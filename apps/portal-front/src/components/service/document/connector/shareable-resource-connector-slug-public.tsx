import { ShareableResourceConnectorDetails } from '@/components/service/document/connector/shareable-resource-connector-details';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { MotionPlayIcon, VerifiedIcon } from '@filigran/icon';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import Image from 'next/image';
import React from 'react';
import { MarkdownAsync } from 'react-markdown';

interface ShareableResourceConnectorSlugPublicProps {
  documentData: documentItem_fragment$data | publicDocumentItemFragment$data;
  pageUrl: string;
  logo: string;
}

const ShareableResourceConnectorSlugPublic: React.FunctionComponent<
  ShareableResourceConnectorSlugPublicProps
> = ({ documentData, logo, pageUrl }) => {
  return (
    <>
      <div className="flex gap-s pb-l flex-col md:flex-row">
        <div className="w-24 flex-shrink-0 rounded overflow-hidden">
          <Image
            src={logo}
            alt={`${documentData.name} logo`}
            width={96}
            height={96}
            loading="lazy"
            className="w-full h-full object-contain rounded"
          />
        </div>
        <div className="flex flex-col flex-1 justify-center">
          <div className="flex items-center gap-s flex-wrap">
            <h1 className="whitespace-nowrap">{documentData.name}</h1>
            {documentData.manager_supported && (
              <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
                <MotionPlayIcon className="h-5 w-5 shrink-0 mr-xs" />
                Deployable
              </div>
            )}
            {documentData.verified && (
              <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
                <VerifiedIcon className="h-5 w-5 shrink-0 mr-xs" />
                Verified
              </div>
            )}
            <div className="ml-auto">
              <ShareLinkButton
                documentId={documentData.id}
                url={pageUrl}
                tooltipText={`Service.OpenctiIntegrations.Actions.Share`}
              />
            </div>
          </div>
          <div className="w-full mt-s mb-xs">
            <BadgeOverflowCounter
              badges={documentData?.use_cases as BadgeOverflow[]}
              className="z-[2]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <div className="flex-[3_3_0%] min-w-0">
          <h3 className="py-s txt-container-title truncate text-muted-foreground">
            Overview
          </h3>
          <section className="border rounded border-border-light bg-page-background overflow-x-auto">
            <h2 className="p-l">{documentData?.short_description}</h2>
            <div className="p-l !bg-page-background markdown-content">
              <MarkdownAsync>{documentData?.description ?? ''}</MarkdownAsync>
            </div>
          </section>
        </div>
        <ShareableResourceConnectorDetails
          connectorDetails={{ ...documentData, name: documentData.name ?? '' }}
        />
      </div>
    </>
  );
};

// Component export
export default ShareableResourceConnectorSlugPublic;
