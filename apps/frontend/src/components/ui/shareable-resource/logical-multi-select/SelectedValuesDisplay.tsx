import { FilterTooltip } from '@/components/ui/shareable-resource/logical-multi-select/FilterTooltip';
import { cn } from '@/lib/utils';
import { CancelIcon } from '@filigran/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui/clients';
import { Button } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import { Fragment, ReactNode } from 'react';

export interface GroupedSelection {
  parentValue: string;
  parentLabel: string;
  children: { value: string; label: string }[];
}

interface SelectedValuesDisplayProps {
  groupedSelections: GroupedSelection[];
  optionLabel: string;
  placeholder: string;
  onRemove?: () => void;
}

interface RemoveFilterButtonProps {
  onRemove?: () => void;
}

export const AndSeparator = ({ className }: { className?: string }) => {
  const t = useTranslations();
  return (
    <span
      className={cn(
        'text-sm h-9 leading-9 px-s bg-gray-200/60 dark:bg-gray-700/60 text-foreground rounded',
        className
      )}>
      {t('Utils.And')}
    </span>
  );
};

export const FilterLabel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        'inline-block text-white dark:text-foreground whitespace-nowrap',
        className
      )}>
      {children}
    </span>
  );
};
export const OrSeparator = ({ className }: { className?: string }) => {
  const t = useTranslations();
  return (
    <span
      className={cn(
        'h-9 leading-9 px-s mx-s bg-gray-500/30 dark:bg-gray-50/30 text-white dark:text-foreground inline-block',
        className
      )}>
      {t('Utils.Or')}
    </span>
  );
};

export const SelectionChip = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn('text-sm inline-block rounded max-w-[400px] ', className)}>
    {children}
  </div>
);

export const ChildrenLabels = ({
  items,
}: {
  items: { value: string; label: string }[];
}) => (
  <>
    {items.map((child, index) => (
      <Fragment key={child.value}>
        {index > 0 && <OrSeparator className="text-foreground" />}
        {child.label}
      </Fragment>
    ))}
  </>
);

const RemoveFilterButton = ({ onRemove }: RemoveFilterButtonProps) => {
  if (!onRemove) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      role="button"
      tabIndex={0}
      onClick={onRemove}
      aria-label="Remove filter"
      asChild>
      <div>
        <CancelIcon className="h-6 w-6 text-muted-foreground ml-xs pr-xs" />
      </div>
    </Button>
  );
};

export const SelectedValuesDisplay = ({
  groupedSelections,
  optionLabel,
  placeholder,
  onRemove,
}: SelectedValuesDisplayProps) => {
  if (groupedSelections.length === 0) {
    return (
      <div className="h-9 flex items-center justify-between border rounded">
        <span
          className="mx-3 text-sm text-foreground normal-case"
          role="textbox"
          aria-readonly="true">
          {placeholder}
        </span>
        <RemoveFilterButton onRemove={onRemove} />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipContent>
          <FilterTooltip
            groupedSelections={groupedSelections}
            optionLabel={optionLabel}
          />
        </TooltipContent>
        <TooltipTrigger
          style={{ cursor: 'unset' }}
          asChild>
          <div className="flex items-center bg-gray-200/60 dark:bg-gray-700/60 text-foreground hover:bg-hover rounded">
            <SelectionChip className="truncate">
              <FilterLabel className="text-foreground pl-s py-s mr-s font-semibold">
                {optionLabel} =
              </FilterLabel>
              {groupedSelections.map((group, index) => (
                <Fragment key={group.parentValue}>
                  {index > 0 && <OrSeparator className="text-foreground" />}
                  {group.children.length > 0 ? (
                    <ChildrenLabels items={group.children} />
                  ) : (
                    <>{group.parentLabel}</>
                  )}
                </Fragment>
              ))}
            </SelectionChip>
            <RemoveFilterButton onRemove={onRemove} />
          </div>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};
