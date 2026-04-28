import { cn } from '@/lib/utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { FunctionComponent } from 'react';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '../../BadgeOverflowCounter';
import { ShareableResourceCardIcon } from './ShareableResourceCardIcon';
import { ShareableResourceCardImage } from './ShareableResourceCardImage';

interface ShareableResourceCardHeaderProps {
  document: documentItem_fragment$data | publicDocumentItemFragment$data;
  serviceInstanceId: string;
  shouldDisplayBothIcons: boolean;
}
export const ShareableResourceCardHeader: FunctionComponent<
  ShareableResourceCardHeaderProps
> = ({ document, serviceInstanceId, shouldDisplayBothIcons }) => {
  const documentNameSize = document.name?.length ?? 0;

  return (
    <div className="flex items-stretch gap-m p-m relative">
      <ShareableResourceCardImage
        document={document}
        serviceInstanceId={serviceInstanceId}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2
            className={cn(
              'text-base font-semibold leading-tight min-w-0 pr-xxl',
              documentNameSize <= 30 && 'md:text-lg'
            )}>
            {document.name}
          </h2>
          <ShareableResourceCardIcon
            shouldDisplayBothIcons={shouldDisplayBothIcons}
            document={document}
          />
        </div>
        <div className="mt-s flex flex-wrap gap-s">
          <BadgeOverflowCounter
            badges={document.use_cases as BadgeOverflow[]}
            className="z-[2]"
          />
        </div>
      </div>
    </div>
  );
};
