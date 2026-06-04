import { ShareableResourceConnectorDetails } from '@/components/service/document/connector/ShareableResourceConnectorDetails';
import ShareableResourceCarousel from '@/components/service/document/ui/ShareableResourceCarouselView';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/BadgeOverflowCounter';
import { ShareLinkButton } from '@/components/ui/share-link/ShareLinkButton';
import { filterDocumentImages, findDocumentLogo } from '@/utils/documents';
import { MotionPlayIcon, VerifiedIcon } from '@filigran/icon';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { MarkdownAsync } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ShareableResourceConnectorSlugPublicProps {
  documentData: documentItem_fragment$data | publicDocumentItemFragment$data;
  serviceInstance:
    | seoServiceInstanceFragment$data
    | serviceInstance_fragment$data;
  pageUrl: string;
}

const ShareableResourceConnectorSlugPublic = ({
  documentData,
  pageUrl,
  serviceInstance,
}: ShareableResourceConnectorSlugPublicProps) => {
  const t = useTranslations();
  const logo = findDocumentLogo(documentData);
  const carouselImages = filterDocumentImages(documentData);

  return (
    <>
      <div className="flex gap-s pb-l flex-col md:flex-row">
        {!!logo && (
          <div className="w-24 shrink-0 rounded overflow-hidden">
            <Image
              src={`/document/images/${serviceInstance.id}/${logo.id}`}
              alt={`${documentData.name} logo`}
              width={96}
              height={96}
              loading="lazy"
              className="w-full h-full object-contain rounded"
            />
          </div>
        )}
        <div className="flex flex-col flex-1 justify-center">
          <div className="flex items-center gap-s flex-wrap">
            <h1 className="whitespace-nowrap">{documentData.name}</h1>
            {documentData.manager_supported && (
              <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
                <MotionPlayIcon className="h-5 w-5 shrink-0 mr-xs" />
                {t('Utils.AutomaticDeploy')}
              </div>
            )}
            {documentData.verified && (
              <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
                <VerifiedIcon className="h-5 w-5 shrink-0 mr-xs" />
                {t('Utils.Verified')}
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

      <ShareableResourceCarousel
        serviceInstance={serviceInstance}
        images={carouselImages}
      />

      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <div className="flex-[3_3_0%] min-w-0">
          <h3 className="py-s txt-container-title truncate text-muted-foreground">
            {t('PublicResourcePage.Overview')}
          </h3>
          <section className="border rounded border-border-light bg-page-background overflow-x-auto">
            <h2 className="p-l">{documentData?.short_description}</h2>
            <div className="p-l !bg-page-background markdown-content">
              <MarkdownAsync remarkPlugins={[remarkGfm]}>
                {documentData?.description ?? ''}
              </MarkdownAsync>
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
