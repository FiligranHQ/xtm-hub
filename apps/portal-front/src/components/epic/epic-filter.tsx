'use client';
import { FiligranProductMapping } from '@/components/epic/epic-item/filigran-product-mapping';
import { Button } from '@filigran/ui/servers';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { useTranslations } from 'next-intl';

export type EpicFilterType = 'all' | FiligranProductEnum;

interface EpicFilterProps {
  selectedFilter: EpicFilterType;
  onSelectedFilterChange: (filter: EpicFilterType) => void;
  xtmhubCount: number;
  openctiCount: number;
  openaevCount: number;
}

export const EpicFilter = ({
  selectedFilter,
  onSelectedFilterChange,
  xtmhubCount,
  openctiCount,
  openaevCount,
}: EpicFilterProps) => {
  const t = useTranslations();

  const totalCount = xtmhubCount + openctiCount + openaevCount;

  return (
    <div className="flex flex-row gap-xs bg-page-background p-xs rounded-lg w-fit text-primary font-bold">
      <Button
        variant={selectedFilter === 'all' ? 'default' : 'ghost'}
        onClick={() => onSelectedFilterChange('all')}>
        {t('Epic.AllProducts')} ({totalCount})
      </Button>
      <Button
        variant={
          selectedFilter === FiligranProductEnum.XTMHUB ? 'default' : 'ghost'
        }
        onClick={() => onSelectedFilterChange(FiligranProductEnum.XTMHUB)}>
        {FiligranProductMapping[FiligranProductEnum.XTMHUB].name} ({xtmhubCount}
        )
      </Button>
      <Button
        variant={
          selectedFilter === FiligranProductEnum.OPENCTI ? 'default' : 'ghost'
        }
        onClick={() => onSelectedFilterChange(FiligranProductEnum.OPENCTI)}>
        {FiligranProductMapping[FiligranProductEnum.OPENCTI].name} (
        {openctiCount})
      </Button>
      <Button
        variant={
          selectedFilter === FiligranProductEnum.OPENAEV ? 'default' : 'ghost'
        }
        onClick={() => onSelectedFilterChange(FiligranProductEnum.OPENAEV)}>
        {FiligranProductMapping[FiligranProductEnum.OPENAEV].name} (
        {openaevCount})
      </Button>
    </div>
  );
};
