'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui';
import { Badge } from '@filigran/ui/servers';
import {
  DeploymentRequestHubStatus,
  TrialsProductFragment,
} from '@graphql/generated';
import { useTranslations } from 'next-intl';

const SUCCESS_CLASS_NAME = 'text-feedback-success-primary';
const RUNNING_CLASS_NAME = 'text-feedback-alert-primary';
const INACTIVE_CLASS_NAME = 'text-feedback-neutral-primary';

const CLASS_NAME_BY_HUB_STATUS: Record<DeploymentRequestHubStatus, string> = {
  [DeploymentRequestHubStatus.Active]: SUCCESS_CLASS_NAME,
  [DeploymentRequestHubStatus.Pending]: RUNNING_CLASS_NAME,
  [DeploymentRequestHubStatus.Provisioning]: RUNNING_CLASS_NAME,
  [DeploymentRequestHubStatus.Queued]: RUNNING_CLASS_NAME,
  [DeploymentRequestHubStatus.Cancelled]: INACTIVE_CLASS_NAME,
  [DeploymentRequestHubStatus.Expired]: INACTIVE_CLASS_NAME,
  [DeploymentRequestHubStatus.Failed]: INACTIVE_CLASS_NAME,
};

interface TrialsProductsProps {
  products: readonly TrialsProductFragment[];
}

export const TrialsProducts = ({ products }: TrialsProductsProps) => {
  const t = useTranslations();

  if (products.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="flex flex-wrap gap-s">
      {products.map((product) => (
        <TooltipProvider
          key={product.id}
          delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={CLASS_NAME_BY_HUB_STATUS[product.hub_status]}>
                {product.platform_identifier?.toUpperCase()}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {t(`TrialsDashboard.ProductStatus.${product.hub_status}`)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};
