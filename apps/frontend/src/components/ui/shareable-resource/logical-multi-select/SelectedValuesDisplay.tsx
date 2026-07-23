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
        'inline-flex items-center h-9 px-2 content-body-compact-medium bg-elevation-background-layer-2 text-text-default-primary rounded-lg',
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
    <span className={cn('inline-block whitespace-nowrap', className)}>
      {children}
    </span>
  );
};
export const OrSeparator = ({ className }: { className?: string }) => {
  const t = useTranslations();
  return (
    <span
      className={cn(
        'inline-flex items-center h-8 px-2 mx-2 content-body-compact-medium bg-elevation-surface-heading-layer-3 text-text-default-primary rounded-lg',
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
  <div
    className={cn(
      'content-body-compact-medium inline-block rounded-lg max-w-[400px]',
      className
    )}>
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
        {index > 0 && <OrSeparator />}
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
      variant="tertiary"
      size="icon"
      role="button"
      tabIndex={0}
      onClick={onRemove}
      aria-label="Remove filter"
      asChild>
      <div>
        <CancelIcon className="h-6 w-6 text-text-default-secondary ml-1 pr-1" />
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
      <div className="h-9 flex items-center justify-between pl-4 pr-2 bg-elevation-background-layer-3 rounded-lg">
        <span
          className="content-body-compact-medium text-text-default-primary normal-case"
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
          <div className="h-9 flex items-center pl-4 pr-2 bg-elevation-background-layer-3 text-text-default-primary hover:bg-hover rounded-lg">
            <SelectionChip className="truncate">
              <FilterLabel className="mr-2 font-semibold">
                {optionLabel} =
              </FilterLabel>
              {groupedSelections.map((group, index) => (
                <Fragment key={group.parentValue}>
                  {index > 0 && <OrSeparator />}
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
