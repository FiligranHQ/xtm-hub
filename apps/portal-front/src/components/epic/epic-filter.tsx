'use client';
import { FiligranProductMapping } from '@/components/epic/epic-item/filigran-product-mapping';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { useTranslations } from 'next-intl';

export type EpicFilterType = 'all' | FiligranProductEnum;

interface EpicFilterProps {
  selectedFilter: EpicFilterType;
  onSelectedFilterChange: (filter: EpicFilterType) => void;
  countsByProduct: Record<FiligranProductEnum, number>;
  showFinished: boolean;
  onShowFinishedChange: (show: boolean) => void;
}

export const EpicFilter = ({
  selectedFilter,
  onSelectedFilterChange,
  countsByProduct,
  showFinished,
  onShowFinishedChange,
}: EpicFilterProps) => {
  const t = useTranslations();

  const products = Object.values(FiligranProductEnum);

  const totalCount = products.reduce(
    (sum, product) => sum + (countsByProduct[product] ?? 0),
    0
  );

  return (
    <>
      <div className="lg:hidden m-s">
        <Select
          value={selectedFilter}
          onValueChange={(value) =>
            onSelectedFilterChange(value as EpicFilterType)
          }>
          <SelectTrigger className="bg-page-background text-primary">
            <SelectValue placeholder={t('Epic.AllProducts')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('Epic.AllProducts')} ({totalCount})
            </SelectItem>
            {products.map((product) => {
              const count = countsByProduct[product] ?? 0;

              return (
                <SelectItem
                  key={product}
                  value={product}>
                  {FiligranProductMapping[product].name} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-row">
        <div className="flex items-center gap-xs px-xs">
          <Switch
            checked={showFinished}
            onCheckedChange={onShowFinishedChange}
          />
          <span className="text-sm font-normal text-white">
            {t('Epic.ShowFinished')}
          </span>
        </div>
        <div className="hidden lg:flex flex-row gap-xs bg-page-background p-xs rounded-lg w-fit text-primary font-bold">
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
      </div>
    </>
  );
};
