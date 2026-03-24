import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { CampaignIcon, MotionPlayIcon, VerifiedIcon } from '@filigran/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui/clients';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';

interface ShareableResourceCardIconProps {
  document: documentItem_fragment$data | publicDocumentItemFragment$data;
  shouldDisplayBothIcons: boolean;
}
export const ShareableResourceCardIcon: FunctionComponent<
  ShareableResourceCardIconProps
> = ({ document, shouldDisplayBothIcons }) => {
  const t = useTranslations();

  return (
    <>
      {document.active && shouldDisplayBothIcons && (
        <TooltipProvider>
          {docHasMetadata(document, 'manager_supported') &&
            document.manager_supported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <MotionPlayIcon className="absolute top-l right-[2.75rem] h-6 w-6 shrink-0 text-green-500" />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-50">
                  {t('Utils.AutomaticDeploy')}
                </TooltipContent>
              </Tooltip>
            )}
          {docHasMetadata(document, DocumentMetadataKeyCodeEnum.VERIFIED) &&
            document.verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <VerifiedIcon className="absolute top-l right-l h-6 w-6 shrink-0 text-green-500" />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-50">
                  {t('Utils.Verified')}
                </TooltipContent>
              </Tooltip>
            )}
        </TooltipProvider>
      )}
      {document.active && !shouldDisplayBothIcons && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CampaignIcon className="absolute top-m right-m h-6 w-6 shrink-0 text-green-500" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-50">
              {t('Badge.Published')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
};
