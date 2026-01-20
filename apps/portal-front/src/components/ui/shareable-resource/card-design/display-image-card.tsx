import {
  PublicShareableResource,
  ShareableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { LogoFiligranIcon } from '@filigran/icon';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import Image from 'next/image';
import { FunctionComponent } from 'react';

interface DisplayImageCardProps {
  document: ShareableResource | PublicShareableResource;
  serviceInstanceId: string;
}
export const DisplayImageCard: FunctionComponent<DisplayImageCardProps> = ({
  document,
  serviceInstanceId,
}) => {
  return (
    <>
      <div className=" items-center self-stretch flex">
        {'integration_type' in document &&
        document.integration_type === IntegrationTypeEnum.CONNECTOR ? (
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
