import * as React from 'react';
import { ReactNode, useContext, useMemo, useState } from 'react';

import { DownloadIcon, LogoFiligranIcon } from '@filigran/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui/clients';
import { Button } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import { BreadcrumbNav, BreadcrumbNavLink } from '../../ui/BreadcrumbNav';

import { filterDocumentImages, findDocumentLogo } from '@/utils/documents';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { isResourceDownloadable } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import Image from 'next/image';
import useDecodedParams from '../../../hooks/use-decoded-params';
import { SettingsContext } from '../../settings/EnvPortalContext';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '../../ui/BadgeOverflowCounter';
import { ShareLinkButton } from '../../ui/share-link/ShareLinkButton';
import OneClickDeploy from './one-click-deploy/OneClickDeploy';
import { OPENCTI_INTEGRATION_URL_CONFIGS } from './one-click-deploy/UseOneClickDeployTab';
import ShareableResourceDetails from './ShareableResouceDetails';
import ShareableResourceDescription from './ShareableResourceDescription';
import ShareableResourceCarousel from './ui/ShareableResourceCarouselView';

// Component interface
interface ShareableResourceSlugProps {
  documentData: documentItem_fragment$data;
  serviceInstance: serviceInstance_fragment$data;
  breadcrumbValue: BreadcrumbNavLink[];
  children?: ReactNode;
  updateActions?: ReactNode;
}

// Component
const ShareableResourceSlug: React.FunctionComponent<
  ShareableResourceSlugProps
> = ({
  documentData,
  serviceInstance,
  breadcrumbValue,
  children,
  updateActions,
}) => {
  const t = useTranslations();
  const { serviceInstanceId } = useDecodedParams();
  const { settings } = useContext(SettingsContext);

  const [documentDownloadNumber, setDocumentDownloadNumber] = useState(
    documentData.download_number ?? 0
  );
  const incrementDownloadNumber = () =>
    setDocumentDownloadNumber((prev) => prev + 1);

  const shouldShowOneClickDeployComponent = useMemo(() => {
    if (!documentData.active) return false;

    if (documentData.integration_type) {
      return documentData.integration_type in OPENCTI_INTEGRATION_URL_CONFIGS;
    }

    return [
      ShareableResourceType.OPENCTI_CUSTOM_DASHBOARD,
      ShareableResourceType.OPENAEV_SCENARIO,
    ].includes(documentData.type as ShareableResourceType);
  }, [documentData]);

  const carouselImages = useMemo(() => {
    return filterDocumentImages(documentData);
  }, [documentData]);

  const logo = useMemo(() => {
    return findDocumentLogo(documentData);
  }, [documentData]);

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex gap-s pb-l flex-col md:flex-row">
        {logo ? (
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
        ) : (
          <div className="w-24 p-m border border-light shrink-0">
            <LogoFiligranIcon className="size-18" />
          </div>
        )}
        <div className="flex flex-col justify-center w-full">
          <div className="flex items-start ">
            <h1 className="whitespace-nowrap mb-s">{documentData.name}</h1>
            <div className="flex gap-s ml-auto">
              <ShareLinkButton
                documentId={documentData.id}
                url={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${documentData?.service_instance?.slug}/${documentData?.slug}`}
              />
              {shouldShowOneClickDeployComponent ? (
                <>
                  {isResourceDownloadable(documentData) && (
                    <TooltipProvider>
                      <Tooltip
                        delayDuration={50}
                        disableHoverableContent={true}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              incrementDownloadNumber();
                              window.location.href = `/document/get/${serviceInstanceId}/${documentData?.id}?attach=1`;
                            }}
                            className="z-[2] text-primary">
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('Service.ShareableResources.Download')}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {updateActions}
                </>
              ) : (
                <>
                  {updateActions}
                  {isResourceDownloadable(documentData) && (
                    <Button
                      onClick={() => {
                        incrementDownloadNumber();
                        window.location.href = `/document/get/${serviceInstanceId}/${documentData?.id}?attach=1`;
                      }}>
                      {t('Utils.Download')}
                    </Button>
                  )}
                </>
              )}
              {shouldShowOneClickDeployComponent && (
                <OneClickDeploy documentData={documentData} />
              )}
            </div>
          </div>
          <div>
            <BadgeOverflowCounter
              badges={documentData.use_cases as BadgeOverflow[]}
            />
          </div>
        </div>
      </div>
      <ShareableResourceCarousel
        serviceInstance={serviceInstance}
        images={carouselImages}
      />
      {children}
      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <ShareableResourceDescription
          shortDescription={documentData?.short_description ?? ''}
          longDescription={documentData?.description ?? ''}
        />
        {documentData && (
          <ShareableResourceDetails
            documentData={documentData}
            downloadNumber={documentDownloadNumber}
          />
        )}
      </div>
    </>
  );
};

// Component export
export default ShareableResourceSlug;
