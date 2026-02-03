import { FilterTooltip } from '@/components/ui/shareable-resource/logical-multi-select/filter-tooltip';
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
import { Fragment, FunctionComponent, ReactNode } from 'react';

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

export const AndSeparator: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  const t = useTranslations();
  return (
    <span
      className={cn(
        'flex items-center p-s text-xs bg-gray-400 text-foreground rounded',
        className
      )}>
      {t('Utils.And')}
    </span>
  );
};

export const FilterLabel: FunctionComponent<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <span className={cn('text-foreground whitespace-nowrap', className)}>
      {children}
    </span>
  );
};
export const OrSeparator: FunctionComponent<{ className?: string }> = ({
  className,
}) => {
  const t = useTranslations();
  return (
    <span
      className={cn(
        'flex items-center p-s text-xs bg-gray-400 text-foreground rounded',
        className
      )}>
      {t('Utils.Or')}
    </span>
  );
};

export const SelectionChip: FunctionComponent<{
  children: ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      'inline-flex items-center gap-xs py-0 text-sm rounded',
      className
    )}>
    {children}
  </div>
);

export const ChildrenLabels: FunctionComponent<{
  items: { value: string; label: string }[];
}> = ({ items }) => (
  <>
    {items.map((child, index) => (
      <Fragment key={child.value}>
        {index > 0 && <OrSeparator />}
        <FilterLabel>{child.label}</FilterLabel>
      </Fragment>
    ))}
  </>
);

const RemoveFilterButton: FunctionComponent<{ onRemove?: () => void }> = ({
  onRemove,
}) => {
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
        <CancelIcon className="h-6 w-6 text-gray/60 ml-xs pr-xs" />
      </div>
    </Button>
  );
};

export const SelectedValuesDisplay: FunctionComponent<
  SelectedValuesDisplayProps
> = ({ groupedSelections, optionLabel, placeholder, onRemove }) => {
  if (groupedSelections.length === 0) {
    return (
      <div className="flex">
        <div className="flex items-center justify-between border rounded">
          <span
            className="mx-3 text-sm text-foreground normal-case"
            role="textbox"
            aria-readonly="true">
            {placeholder}
          </span>
          <RemoveFilterButton onRemove={onRemove} />
        </div>
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
          className="w-full"
          style={{ cursor: 'unset' }}
          asChild>
          <div className="flex bg-gray-700/60 hover:bg-hover rounded">
            <div className="flex items-center truncate max-w-[400px]">
              <SelectionChip>
                <FilterLabel className="pl-s py-s font-semibold">
                  {optionLabel} =
                </FilterLabel>
                {groupedSelections.map((group, index) => (
                  <Fragment key={group.parentValue}>
                    {index > 0 && <OrSeparator />}
                    {group.children.length > 0 ? (
                      <ChildrenLabels items={group.children} />
                    ) : (
                      <FilterLabel>{group.parentLabel}</FilterLabel>
                    )}
                  </Fragment>
                ))}
              </SelectionChip>
            </div>
            <RemoveFilterButton onRemove={onRemove} />
          </div>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  );
};
