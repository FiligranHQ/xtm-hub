'use client';
import { DisplayFooterCard } from '@/components/ui/shareable-resource/card-design/display-footer-card';
import { DisplayHeaderCard } from '@/components/ui/shareable-resource/card-design/display-header-card';
import {
  PublicShareableResource,
  ShareableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
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
  document: ShareableResource | PublicShareableResource;
  detailUrl: string;
  shareLinkUrl: string;
  extraContent?: ReactNode;
  serviceInstance: ShareableServiceInstance;
  publicPath?: boolean;
}

const ShareableResourceCard = ({
  document,
  detailUrl,
  shareLinkUrl,
  extraContent,
  serviceInstance,
  publicPath = false,
}: ShareableResourceCardProps) => {
  return (
    <>
      <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background aria-disabled:opacity-60 hover:bg-hover">
        <Link
          className="flex flex-col h-full"
          href={detailUrl}>
          <DisplayHeaderCard
            document={document}
            serviceInstanceId={serviceInstance.id}
          />
          <p className="p-m text-gray-300 text-sm">
            {document.short_description}
          </p>
        </Link>
        <div className="flex items-center justify-between gap-m pl-m pb-m mt-auto">
          <DisplayFooterCard
            document={document}
            publicPath={publicPath}
            shareLinkUrl={shareLinkUrl}
            extraContent={extraContent}
          />
        </div>
      </li>
    </>
  );
};

export default ShareableResourceCard;
