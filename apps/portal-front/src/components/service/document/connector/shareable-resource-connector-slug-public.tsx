import { ShareableResourceConnectorDetails } from '@/components/service/document/connector/shareable-resource-connector-details';
import { ShareableResourceBasicInformation } from '@/components/service/document/ui/shareable-resource-basic-information';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { SubscribableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { Merge } from '@/utils/typescript';
import { seoIntegrationFeedConnectorFragment$data } from '@generated/seoIntegrationFeedConnectorFragment.graphql';
import { seoIntegrationFeedFragment$data } from '@generated/seoIntegrationFeedFragment.graphql';
import { VerifiedIcon } from 'filigran-icon';
import Image from 'next/image';
import React from 'react';
import { MarkdownAsync } from 'react-markdown';

export type ShareableResourceConnectorType = Merge<
  Merge<SubscribableResource, seoIntegrationFeedFragment$data>,
  seoIntegrationFeedConnectorFragment$data
>;
interface ShareableResourceConnectorSlugPublicProps {
  documentData: ShareableResourceConnectorType;
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
            {documentData.verified && (
              <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
                <VerifiedIcon className="h-5 w-5 shrink-0 mr-xs" />
                Verified
              </div>
            )}
            <div className=" ml-auto">
              <ShareLinkButton
                documentId={documentData.id}
                url={pageUrl}
                tooltipText={`Service.OpenctiIntegrationFeeds.Actions.Share`}
              />
            </div>
          </div>
          <div className="w-full mt-s mb-xs">
            <BadgeOverflowCounter
              badges={documentData?.labels as BadgeOverflow[]}
              className="z-[2]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <div className="flex-[3_3_0%]">
          <h3 className="py-s txt-container-title truncate text-muted-foreground">
            Overview
          </h3>
          <section className="border rounded border-border-light bg-page-background">
            <h2 className="p-l">{documentData?.short_description}</h2>
            <div className="p-l !bg-page-background">
              <MarkdownAsync>{documentData?.description ?? ''}</MarkdownAsync>
            </div>
          </section>
        </div>
        <ShareableResourceBasicInformation>
          <ShareableResourceConnectorDetails connectorDetails={documentData} />
        </ShareableResourceBasicInformation>
      </div>
    </>
  );
};

// Component export
export default ShareableResourceConnectorSlugPublic;
