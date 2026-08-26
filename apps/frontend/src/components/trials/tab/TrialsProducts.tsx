'use client';
import {
  resolveProductStatusClassName,
  sortProducts,
} from '@/components/trials/tab/trials-tab.utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui';
import { Badge } from '@filigran/ui/servers';
import { TrialsProductFragment } from '@graphql/generated';
import { useTranslations } from 'next-intl';

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
      {sortProducts(products).map((product) => (
        <TooltipProvider
          key={product.id}
          delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className={resolveProductStatusClassName(product.hub_status)}>
                {product.platform_identifier?.toUpperCase()}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {t(`ManageTrials.ProductStatus.${product.hub_status}`)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};
