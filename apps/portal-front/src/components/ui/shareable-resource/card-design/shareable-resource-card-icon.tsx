import {
  PublicShareableResource,
  ShareableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { CampaignIcon, MotionPlayIcon, VerifiedIcon } from '@filigran/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui/clients';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';

interface DisplayIconCardProps {
  document: ShareableResource | PublicShareableResource;
}
export const ShareableResourceCardIcon: FunctionComponent<
  DisplayIconCardProps
> = ({ document }) => {
  const t = useTranslations();

  return (
    <>
      {document.active &&
        'integration_type' in document &&
        document.integration_type === IntegrationTypeEnum.CONNECTOR && (
          <TooltipProvider>
            {document.manager_supported && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <MotionPlayIcon className="absolute top-l right-[2.75rem] h-6 w-6 shrink-0 text-green-500" />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-50">
                  {t('Utils.AutomaticDeploy')}
                </TooltipContent>
              </Tooltip>
            )}
            {document.verified && (
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
      {document.active &&
        'integration_type' in document &&
        document.integration_type !== IntegrationTypeEnum.CONNECTOR && (
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
