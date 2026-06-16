'use client';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/BadgeOverflowCounter';
import { ShareableResourceCardFooterAuthor } from '@/components/ui/shareable-resource/card-design/ShareableResourceCardFooterAuthor';
import { ShareableResourceCardFooterVersion } from '@/components/ui/shareable-resource/card-design/ShareableResourceCardFooterVersions';
import { ShareableResourceCardHeader } from '@/components/ui/shareable-resource/card-design/ShareableResourceCardHeader';
import useScrollPosition from '@/hooks/use-scroll-position';
import {
  PublicDocumentData,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCodeEnum } from '@generated/models/DocumentMetadataKeyCode.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { ServiceDefinitionIdentifier } from '@generated/serviceList_fragment.graphql';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ShareableServiceInstance {
  id: string;
  service_definition?: {
    identifier: ServiceDefinitionIdentifier;
  } | null;
}
interface ShareableResourceCardProps {
  document: documentItem_fragment$data | PublicDocumentData;
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
  const { save } = useScrollPosition();
  const handleClick = () => {
    save();
  };
  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background aria-disabled:opacity-60 hover:bg-hover h-[348px]">
      <Link
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
        onClick={handleClick}
        href={detailUrl}>
        <ShareableResourceCardHeader
          document={document}
          shouldDisplayBothIcons={
            docHasMetadata(
              document,
              DocumentMetadataKeyCodeEnum.INTEGRATION_TYPE
            ) &&
            !!document.integration_type &&
            FOOTER_VERSIONS_INTEGRATION_TYPES.includes(
              document.integration_type
            )
          }
          serviceInstanceId={serviceInstance.id}
        />
        <div className="p-m flex flex-col gap-s">
          <p className="text-muted-foreground text-sm">
            {document.short_description}
          </p>
          <BadgeOverflowCounter
            badges={document.use_cases as BadgeOverflow[]}
            className="z-2"
          />
        </div>
      </Link>
      <div className="flex items-center justify-between gap-m pl-m pb-m mt-auto">
        {docHasMetadata(
          document,
          DocumentMetadataKeyCodeEnum.INTEGRATION_TYPE
        ) &&
        document.integration_type &&
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
              (docHasMetadata(
                document,
                DocumentMetadataKeyCodeEnum.INTEGRATION_TYPE
              ) &&
                document.integration_type &&
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
