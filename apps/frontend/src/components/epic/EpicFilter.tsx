'use client';
import { FiligranProductMapping } from '@/components/epic/epic-item/FiligranProductMapping';
import { SearchInput } from '@/components/ui/SearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@filigran/ui';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { useTranslations } from 'next-intl';
import React from 'react';

export type EpicFilterType = 'all' | FiligranProductEnum;

interface EpicFilterProps {
  selectedFilter?: EpicFilterType;
  onSelectedFilterChange: (filter: EpicFilterType) => void;
  countsByProduct: Record<FiligranProductEnum, number>;
  showFinished: boolean;
  onShowFinishedChange: (show: boolean) => void;
  debounceHandleInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EpicFilter = ({
  selectedFilter,
  onSelectedFilterChange,
  countsByProduct,
  showFinished,
  onShowFinishedChange,
  debounceHandleInput,
}: EpicFilterProps) => {
  const t = useTranslations();

  const products = Object.values(FiligranProductEnum);

  const totalCount = products.reduce(
    (sum, product) => sum + (countsByProduct[product] ?? 0),
    0
  );

  return (
    <div className="ml-xl pl-m grid grid-cols-1 sm:grid-cols-3 gap-l items-center">
      <div className="max-w-full sm:max-w-[100%]">
        <SearchInput
          placeholder={t('GenericActions.Search')}
          onChange={debounceHandleInput}
        />
      </div>

      <div className="max-w-full sm:max-w-[100%]">
        <Select
          value={selectedFilter}
          onValueChange={(value) =>
            onSelectedFilterChange(value as EpicFilterType)
          }>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('Epic.FilterByProduct')} />
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
      <div className="ml-auto flex items-center gap-s">
        <Switch
          checked={showFinished}
          onCheckedChange={onShowFinishedChange}
        />
        <span className="text-sm">{t('Epic.ShowFinished')}</span>
      </div>
    </div>
  );
};
