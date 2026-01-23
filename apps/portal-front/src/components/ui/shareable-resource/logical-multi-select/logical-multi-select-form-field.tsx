import { CloseIcon } from '@filigran/icon';
import {
  Command,
  CommandInput,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipProvider,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import * as React from 'react';
import { useMemo } from 'react';
import { FlatOption, OptionsList } from './options-list';
import {
  GroupedSelection,
  SelectedValuesDisplay,
} from './selected-values-display';

type Selection = Record<string, string[]>;

const isSelection = (item: unknown): item is Selection => {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) {
    return false;
  }

  return Object.values(item).every(
    (value) => Array.isArray(value) && value.every((v) => typeof v === 'string')
  );
};

interface MultiSelectFormFieldProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any> = Record<string, any>,
> extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  options: T[];
  keyLabel?: keyof T;
  keyValue?: keyof T;
  keyChildren?: keyof T;
  initialValue?: Selection;
  placeholder: string;
  noResultString: string;
  onValueChange: (value: Selection) => void;
  onInputChange?: (value: string) => void;
  onRemove?: () => void;
  optionLabel: string;
  childOptionLabel?: string;
}

const LogicalMultiSelectFormField = React.forwardRef<
  HTMLButtonElement,
  MultiSelectFormFieldProps
>(
  (
    {
      options,
      keyLabel = 'label',
      keyValue = 'value',
      keyChildren = 'children',
      initialValue,
      onValueChange,
      onInputChange,
      onRemove,
      optionLabel,
      childOptionLabel,
      placeholder,
      noResultString = 'No results found',
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] = React.useState<Selection>(
      initialValue || {}
    );
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const flatOptions = useMemo<FlatOption[]>(() => {
      const res: FlatOption[] = [];
      for (const parent of options) {
        const parentValue = String(parent[keyValue]);
        const parentLabel = String(parent[keyLabel]);
        res.push({ type: 'parent', value: parentValue, label: parentLabel });
        const children = parent[keyChildren];
        if (Array.isArray(children)) {
          for (const child of children) {
            res.push({
              type: 'child',
              value: String(child[keyValue]),
              label: String(child[keyLabel]),
              parentValue,
            });
          }
        }
      }
      return res;
    }, [options, keyValue, keyLabel, keyChildren]);

    const getChildIdsForParent = (parentValue: string): string[] => {
      const parent = options.find((o) => String(o[keyValue]) === parentValue);
      if (!parent) return [];
      const children = (parent[keyChildren] ?? []) as typeof options;
      return children.map((child) => String(child[keyValue]));
    };

    const isParentFullySelected = (parentValue: string): boolean => {
      const childValues = selectedValues[parentValue];
      return childValues !== undefined && childValues.length === 0;
    };

    const isParentPartiallySelected = (parentValue: string): boolean => {
      const childIds = getChildIdsForParent(parentValue);
      if (childIds.length > 0 && parentValue in selectedValues) {
        const selectedChildren = selectedValues[parentValue];
        if (selectedChildren) {
          return (
            selectedChildren.length > 0 &&
            selectedChildren.length < childIds.length
          );
        }
      }
      return false;
    };

    const isChildSelected = (
      parentValue: string,
      childValue: string
    ): boolean => {
      const childValues = selectedValues[parentValue];
      if (childValues === undefined) return false;
      if (childValues.length === 0) return true;
      return childValues.includes(childValue);
    };

    const groupedSelections = useMemo<GroupedSelection[]>(() => {
      const groups: GroupedSelection[] = [];

      for (const parent of options) {
        const parentValue = String(parent[keyValue]);
        const parentLabel = String(parent[keyLabel]);
        const children = parent[keyChildren] as typeof options;

        if (!(parentValue in selectedValues)) continue;

        const selectedChildValues = selectedValues[parentValue];

        if (children) {
          if (!selectedChildValues || selectedChildValues.length === 0) {
            groups.push({ parentValue, parentLabel, children: [] });
          } else {
            const selectedChildren = children
              .filter((child) =>
                selectedChildValues.includes(String(child[keyValue]))
              )
              .map((child) => ({
                value: String(child[keyValue]),
                label: String(child[keyLabel]),
              }));
            if (selectedChildren.length > 0) {
              groups.push({
                parentValue,
                parentLabel,
                children: selectedChildren,
              });
            }
          }
        } else {
          groups.push({ parentValue, parentLabel, children: [] });
        }
      }
      return groups;
    }, [options, selectedValues, keyValue, keyLabel, keyChildren]);

    const toggleChild = (childValue: string, parentValue: string) => {
      const newSelection = { ...selectedValues };
      const childIds = getChildIdsForParent(parentValue);
      const selectedChildren = newSelection[parentValue];

      if (selectedChildren === undefined) {
        newSelection[parentValue] =
          childIds.length === 1
            ? []
            : (newSelection[parentValue] = [childValue]);
      } else if (selectedChildren.length === 0) {
        const remaining = childIds.filter((id) => id !== childValue);
        if (remaining.length === 0) {
          delete newSelection[parentValue];
        } else {
          newSelection[parentValue] = remaining;
        }
      } else {
        if (selectedChildren.includes(childValue)) {
          const remaining = selectedChildren.filter((id) => id !== childValue);
          if (remaining.length === 0) {
            delete newSelection[parentValue];
          } else {
            newSelection[parentValue] = remaining;
          }
        } else {
          const updated = [...selectedChildren, childValue];
          if (childIds.every((id) => updated.includes(id))) {
            newSelection[parentValue] = [];
          } else {
            newSelection[parentValue] = updated;
          }
        }
      }
      setSelectedValues(newSelection);
      onValueChange(newSelection);
    };

    const toggleParent = (parentValue: string) => {
      const newSelection = { ...selectedValues };
      const childIds = getChildIdsForParent(parentValue);

      if (childIds.length === 0) {
        if (parentValue in newSelection) {
          delete newSelection[parentValue];
        } else {
          newSelection[parentValue] = [];
        }
      } else {
        if (
          parentValue in newSelection &&
          newSelection[parentValue]?.length === 0
        ) {
          delete newSelection[parentValue];
        } else {
          newSelection[parentValue] = [];
        }
      }

      setSelectedValues(newSelection);
      onValueChange(newSelection);
    };

    const handleClearAll = () => {
      setSelectedValues({});
      onValueChange({});
    };

    const handleSearchInputChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      onInputChange?.(event.target.value);
    };

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true);
      }
    };

    return (
      <TooltipProvider delayDuration={0}>
        <div
          className="sr-only"
          aria-hidden="true">
          <CloseIcon />
        </div>
        <Popover
          open={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              {...props}
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className="flex h-auto min-h-9 w-full items-center justify-between bg-inherit p-0 hover:bg-hover">
              <SelectedValuesDisplay
                groupedSelections={groupedSelections}
                optionLabel={optionLabel}
                childOptionLabel={childOptionLabel}
                placeholder={placeholder}
                onRemove={onRemove}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] p-0 drop-shadow-sm"
            align="start"
            onEscapeKeyDown={() => setIsPopoverOpen(false)}>
            <Command onChange={handleSearchInputChange}>
              <CommandInput
                placeholder="Search..."
                onKeyDown={handleInputKeyDown}
              />
              <CommandList>
                <OptionsList
                  flatOptions={flatOptions}
                  noResultString={noResultString}
                  isParentFullySelected={isParentFullySelected}
                  isParentPartiallySelected={isParentPartiallySelected}
                  isChildSelected={isChildSelected}
                  toggleParent={toggleParent}
                  toggleChild={toggleChild}
                  onClear={handleClearAll}
                  onClose={() => setIsPopoverOpen(false)}
                  showClear={groupedSelections.length > 0}
                />
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    );
  }
);

LogicalMultiSelectFormField.displayName = 'LogicalMultiSelectFormField';

export {
  isSelection as isLogicalMultiSelectSelection,
  LogicalMultiSelectFormField,
};
export type { Selection as LogicalMultiSelectSelection };
