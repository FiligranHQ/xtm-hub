import { cn } from '@/lib/utils';
import { ArrowDownwardIcon, ArrowUpwardIcon } from '@filigran/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { OrderingModeEnum } from '@generated/models/OrderingMode.enum';
import { useTranslations } from 'next-intl';

interface SortControlsProps {
  orderByOptions: { label: string; value: string }[];
  onOrderByChange: (value: string) => void;
  onOrderModeChange: (value: OrderingModeEnum) => void;
  selectedOrderBy: string;
  selectedOrderMode: OrderingModeEnum;
  className?: string;
}

export const SortControls = ({
  orderByOptions,
  onOrderByChange,
  onOrderModeChange,
  selectedOrderMode,
  selectedOrderBy,
  className,
}: SortControlsProps) => {
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
        size="icon"
        className="flex-none basis-9"
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
          <ArrowUpwardIcon className="h-4 w-4" />
        ) : (
          <ArrowDownwardIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
