import { cn } from '@/lib/utils';
import { CancelIcon, KeyboardArrowDownIcon } from '@filigran/icon';
import { Button } from '@filigran/ui/servers';
import * as React from 'react';

export interface GroupedSelection {
  parentValue: string;
  parentLabel: string;
  children: { value: string; label: string }[];
}

interface SelectedValuesDisplayProps {
  groupedSelections: GroupedSelection[];
  optionLabel: string;
  childOptionLabel?: string;
  placeholder: string;
  onRemove?: () => void;
}

export const AndSeparator: React.FC = () => (
  <span className="flex items-center px-s py-[10px] text-xs bg-gray-400 text-foreground rounded">
    AND
  </span>
);

export const OrSeparator: React.FC = () => (
  <div className="py-0">
    <span className="flex items-center px-s py-[10px] text-xs bg-gray-400 text-foreground rounded">
      OR
    </span>
  </div>
);

const SelectionChip: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="inline-flex items-center bg-gray-700 px-2 py-0 text-sm rounded">
    {children}
  </div>
);

const ParentLabel: React.FC<{
  optionLabel: string;
  parentLabel: string;
}> = ({ optionLabel, parentLabel }) => (
  <>
    <span className="pl-xs py-s font-semibold text-foreground">
      {optionLabel} =
    </span>
    <span className="text-foreground">{parentLabel}</span>
  </>
);

const ChildrenLabels: React.FC<{
  childOptionLabel?: string;
  items: { value: string; label: string }[];
}> = ({ childOptionLabel, items }) => (
  <div className="flex items-center px-xs gap-xs">
    <AndSeparator />
    <span className="font-semibold text-foreground pl-xs">
      {childOptionLabel} =
    </span>
    {items.map((child, index) => (
      <React.Fragment key={child.value}>
        {index > 0 && <OrSeparator />}
        <span
          className={cn(
            'inline-flex items-center bg-inherit py-xs text-sm text-foreground',
            index === 0 ? 'pr-xs' : 'px-xs'
          )}>
          {child.label}
        </span>
      </React.Fragment>
    ))}
  </div>
);

const RemoveFilterButton: React.FC<{ onRemove?: () => void }> = ({
  onRemove,
}) => {
  if (!onRemove) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onRemove}>
      <CancelIcon className="h-6 w-6 text-gray/60 ml-xs pr-xs" />
    </Button>
  );
};

export const SelectedValuesDisplay: React.FC<SelectedValuesDisplayProps> = ({
  groupedSelections,
  optionLabel,
  childOptionLabel,
  placeholder,
  onRemove,
}) => {
  if (groupedSelections.length === 0) {
    return (
      <div className="flex">
        <div className="flex w-full items-center justify-between border rounded">
          <span
            className="mx-3 text-sm text-foreground normal-case"
            role="textbox"
            aria-readonly="true">
            {placeholder}
          </span>
          <KeyboardArrowDownIcon
            className="mx-2 w-2.5 h-2.5 cursor-pointer text-foreground"
            aria-hidden="true"
          />
        </div>
        <RemoveFilterButton onRemove={onRemove} />
      </div>
    );
  }

  const selectionsWithChildren = groupedSelections.filter(
    (g) => g.children.length > 0
  );
  const selectionsWithoutChildren = groupedSelections.filter(
    (g) => g.children.length === 0
  );

  return (
    <div className="flex w-full items-center">
      <div className="flex flex-1 flex-wrap items-center gap-xs overflow-hidden bg-inherit p-0">
        {selectionsWithChildren.map((group, index) => (
          <React.Fragment key={group.parentValue}>
            {index > 0 && <OrSeparator />}
            <SelectionChip>
              <ParentLabel
                optionLabel={optionLabel}
                parentLabel={group.parentLabel}
              />
              <ChildrenLabels
                childOptionLabel={childOptionLabel}
                items={group.children}
              />
            </SelectionChip>
          </React.Fragment>
        ))}

        {selectionsWithoutChildren.length > 0 && (
          <>
            {selectionsWithChildren.length > 0 && <OrSeparator />}
            <SelectionChip>
              <span className="pl-1 py-2 font-semibold text-foreground">
                {optionLabel} =
              </span>
              {selectionsWithoutChildren.map((group, index) => (
                <React.Fragment key={group.parentValue}>
                  {index > 0 && <OrSeparator />}
                  <span className="text-foreground px-xs">
                    {group.parentLabel}
                  </span>
                </React.Fragment>
              ))}
            </SelectionChip>
          </>
        )}

        <RemoveFilterButton onRemove={onRemove} />
      </div>
    </div>
  );
};
