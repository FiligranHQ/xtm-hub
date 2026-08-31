'use client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui';
import { TrialsProductFragment } from '@graphql/generated';

interface TrialsProductValuesProps {
  products: readonly TrialsProductFragment[];
  valueOf: (product: TrialsProductFragment) => string | null | undefined;
}

export const TrialsProductValues = ({
  products,
  valueOf,
}: TrialsProductValuesProps) => {
  const valuedProducts = products.filter((product) => !!valueOf(product));

  if (valuedProducts.length === 0) {
    return <span>-</span>;
  }

  return (
    <div className="flex flex-col gap-xs">
      {valuedProducts.map((product) => (
        <TooltipProvider
          key={product.id}
          delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate cursor-help">
                <span className="text-text-default-secondary">
                  {product.platform_identifier?.toUpperCase()}
                </span>{' '}
                {valueOf(product)}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              {valueOf(product)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};
