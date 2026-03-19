'use client';
import { FiligranProductMapping } from '@/components/epic/epic-item/filigran-product-mapping';
import { Button } from '@filigran/ui/servers';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { useTranslations } from 'next-intl';

export type EpicFilterType = 'all' | FiligranProductEnum;

interface EpicFilterProps {
  selectedFilter: EpicFilterType;
  onSelectedFilterChange: (filter: EpicFilterType) => void;
  countsByProduct: Record<FiligranProductEnum, number>;
}

export const EpicFilter = ({
  selectedFilter,
  onSelectedFilterChange,
  countsByProduct,
}: EpicFilterProps) => {
  const t = useTranslations();

  const products = Object.values(FiligranProductEnum);

  const totalCount = products.reduce(
    (sum, product) => sum + (countsByProduct[product] ?? 0),
    0
  );

  return (
    <div className="flex flex-row gap-xs bg-page-background p-xs rounded-lg w-fit text-primary font-bold">
      <Button
        variant={selectedFilter === 'all' ? 'default' : 'ghost'}
        onClick={() => onSelectedFilterChange('all')}>
        {t('Epic.AllProducts')} ({totalCount})
      </Button>

      {products.map((product) => {
        const count = countsByProduct[product] ?? 0;

        return (
          <Button
            key={product}
            variant={selectedFilter === product ? 'default' : 'ghost'}
            onClick={() => onSelectedFilterChange(product)}>
            {FiligranProductMapping[product].name} ({count})
          </Button>
        );
      })}
    </div>
  );
};
