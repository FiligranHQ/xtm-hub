'use client';
import { ShareableResourceCardFooterAuthor } from '@/components/ui/shareable-resource/card-design/shareable-resource-card-footer-author';
import { ShareableResourceCardFooterVersion } from '@/components/ui/shareable-resource/card-design/shareable-resource-card-footer-versions';
import { ShareableResourceCardHeader } from '@/components/ui/shareable-resource/card-design/shareable-resource-card-header';
import {
  PublicShareableResource,
  ShareableResource,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { ServiceDefinitionIdentifier } from '@generated/serviceList_fragment.graphql';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useSessionStorage } from 'usehooks-ts';

interface ShareableServiceInstance {
  id: string;
  service_definition?: {
    identifier: ServiceDefinitionIdentifier;
  } | null;
}
interface ShareableResourceCardProps {
  document: ShareableResource | PublicShareableResource;
  detailUrl: string;
  shareLinkUrl: string;
  extraContent?: ReactNode;
  serviceInstance: ShareableServiceInstance;
  publicPath?: boolean;
}

const FOOTER_VERSIONS_INTEGRATION_TYPES: string[] = [
  IntegrationTypeEnum.CONNECTOR,
];

const FOOTER_NO_AUTHOR_INTEGRATION_TYPES: string[] = [
  IntegrationTypeEnum.THIRD_PARTY_INTEGRATION,
];

const ShareableResourceCard = ({
  document,
  detailUrl,
  shareLinkUrl,
  extraContent,
  serviceInstance,
  publicPath = false,
}: ShareableResourceCardProps) => {
  const [, setScrollPosition] = useSessionStorage('scrollPosition', {});
  const handleClick = () => {
    const scrollContainer = window.document.querySelector('main');
    const scrollTop =
      scrollContainer?.scrollTop === 0
        ? window.scrollY
        : scrollContainer?.scrollTop;
    setScrollPosition({
      container: scrollContainer?.scrollTop === 0 ? 'window' : 'main',
      position: scrollTop,
    });
  };
  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background aria-disabled:opacity-60 hover:bg-hover h-[348px]">
      <Link
        className="flex flex-col h-full"
        onClick={handleClick}
        href={detailUrl}>
        <ShareableResourceCardHeader
          document={document}
          shouldDisplayBothIcons={
            docHasMetadata(document, 'integration_type') &&
            FOOTER_VERSIONS_INTEGRATION_TYPES.includes(
              document.integration_type
            )
          }
          serviceInstanceId={serviceInstance.id}
        />
        <p className="p-m text-gray-300 text-sm">
          {document.short_description}
        </p>
      </Link>
      <div className="flex items-center justify-between gap-m pl-m pb-m mt-auto">
        {docHasMetadata(document, 'integration_type') &&
        FOOTER_VERSIONS_INTEGRATION_TYPES.includes(
          document.integration_type
        ) ? (
          <ShareableResourceCardFooterVersion
            document={document}
            publicPath={publicPath}
            shareLinkUrl={shareLinkUrl}
            extraContent={extraContent}
          />
        ) : (
          <ShareableResourceCardFooterAuthor
            shouldDisplayAuthor={
              (docHasMetadata(document, 'integration_type') &&
                !FOOTER_NO_AUTHOR_INTEGRATION_TYPES.includes(
                  document.integration_type
                )) ||
              document.type !== ShareableResourceType.OPENCTI_INTEGRATION
            }
            document={document}
            shareLinkUrl={shareLinkUrl}
            extraContent={extraContent}
          />
        )}
      </div>
    </li>
  );
};

export default ShareableResourceCard;
