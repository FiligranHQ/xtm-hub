import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { DisplayIconCard } from '@/components/ui/shareable-resource/card-design/display-icon-card';
import { DisplayImageCard } from '@/components/ui/shareable-resource/card-design/display-image-card';
import {
  PublicShareableResource,
  ShareableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { FunctionComponent } from 'react';

interface DisplayHeaderCardProps {
  document: ShareableResource | PublicShareableResource;
  serviceInstanceId: string;
}
export const DisplayHeaderCard: FunctionComponent<DisplayHeaderCardProps> = ({
  document,
  serviceInstanceId,
}) => {
  return (
    <div className="flex items-stretch gap-m p-m relative">
      <DisplayImageCard
        document={document}
        serviceInstanceId={serviceInstanceId}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base md:text-lg font-semibold leading-tight min-w-0 pr-xxl">
            {document.name}
          </h2>
          <DisplayIconCard document={document} />
        </div>
        <div className="mt-s flex flex-wrap gap-s">
          <BadgeOverflowCounter
            badges={document.labels as BadgeOverflow[]}
            className="z-[2]"
          />
        </div>
      </div>
    </div>
  );
};
