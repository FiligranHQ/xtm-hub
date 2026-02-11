import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { OrderingModeEnum } from '@generated/models/OrderingMode.enum';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';

interface Props {
  orderByOptions: { label: string; value: string }[];
  onOrderByChange: (value: string) => void;
  onOrderModeChange: (value: OrderingModeEnum) => void;
  selectedOrderBy: string;
  selectedOrderMode: OrderingModeEnum;
  className?: string;
}

export const SortControls: React.FC<Props> = ({
  orderByOptions,
  onOrderByChange,
  onOrderModeChange,
  selectedOrderMode,
  selectedOrderBy,
  className,
}) => {
  const t = useTranslations();

  return (
    <div className={cn(className, 'flex gap-s items-center')}>
      <span className="whitespace-nowrap text-sm">
        {t('SortControls.SortBy')}
      </span>
      <Select
        onValueChange={onOrderByChange}
        defaultValue={selectedOrderBy}>
        <SelectTrigger>
          <SelectValue placeholder={t('SortControls.SortBy')} />
        </SelectTrigger>
        <SelectContent>
          {orderByOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        className="p-1"
        variant="ghost-primary"
        aria-label={`${t('SortControls.SortBy')} ${selectedOrderMode}`}
        onClick={() =>
          onOrderModeChange(
            selectedOrderMode === OrderingModeEnum.ASC
              ? OrderingModeEnum.DESC
              : OrderingModeEnum.ASC
          )
        }>
        {selectedOrderMode === OrderingModeEnum.DESC ? (
          <ArrowUp />
        ) : (
          <ArrowDown />
        )}
      </Button>
    </div>
  );
};
