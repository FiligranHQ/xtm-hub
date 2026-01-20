import { cn } from '@/lib/utils';
import { CheckIcon, CloseIcon, KeyboardArrowDownIcon } from '@filigran/icon';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  TooltipProvider,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import * as React from 'react';
import { useMemo } from 'react';

// Empty array means parent itself is selected (all children)
type Selection = Record<string, string[]>;

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
  optionLabel: string;
  childOptionLabel?: string;
}

type FlatOption =
  | {
      type: 'parent';
      value: string;
      label: string;
    }
  | {
      type: 'child';
      value: string;
      label: string;
      parentValue: string;
    };

interface GroupedSelection {
  parentValue: string;
  parentLabel: string;
  children: { value: string; label: string }[];
}

const AndSeparator: React.FC = () => (
  <span className="flex items-center px-s py-[10px] text-xs bg-gray-400 text-foreground">
    AND
  </span>
);

const OrSeparator: React.FC = () => (
  <div className="py-0">
    <span className="flex items-center px-s py-[10px] text-xs bg-gray-400 text-foreground">
      OR
    </span>
  </div>
);

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

    const handleSearchInputChange = (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      onInputChange && onInputChange(event.target.value);
    };

    const flatOptions = React.useMemo<FlatOption[]>(() => {
      const res: FlatOption[] = [];
      for (const parent of options) {
        const parentValue = String(parent[keyValue]);
        const parentLabel = String(parent[keyLabel]);
        res.push({
          type: 'parent',
          value: parentValue,
          label: parentLabel,
        });
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

    const getChildIdsForParent = (parentValue: string): string[] => {
      const parent = options.find((o) => String(o[keyValue]) === parentValue);
      if (!parent) return [];
      const children = (parent[keyChildren] ?? []) as typeof options;
      return children.map((child) => String(child[keyValue]));
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
            groups.push({
              parentValue,
              parentLabel,
              children: [],
            });
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
          groups.push({
            parentValue,
            parentLabel,
            children: [],
          });
        }
      }

      return groups;
    }, [options, selectedValues, keyValue, keyLabel, keyChildren]);

    const toggleChild = (childValue: string, parentValue: string) => {
      const newSelection = { ...selectedValues };
      const childIds = getChildIdsForParent(parentValue);
      const selectedChildren = newSelection[parentValue];

      if (selectedChildren === undefined) {
        if (childIds.length === 1) {
          newSelection[parentValue] = [];
        } else {
          newSelection[parentValue] = [childValue];
        }
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

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === 'Enter') {
        setIsPopoverOpen(true);
      }
    };

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

    const SelectionChip: React.FC<{ children: React.ReactNode }> = ({
      children,
    }) => (
      <div className="inline-flex items-center bg-gray-700 px-2 py-0 text-sm">
        {children}
      </div>
    );

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
              {groupedSelections.length > 0 ? (
                <div className="flex w-full items-center">
                  <div className="flex flex-1 flex-wrap items-center gap-s overflow-hidden bg-inherit p-0">
                    {/* Parents with specific children */}
                    {groupedSelections
                      .filter((g) => g.children.length > 0)
                      .map((group, index) => (
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

                    {/* Grouped parents without children */}
                    {groupedSelections.some((g) => g.children.length === 0) && (
                      <>
                        {groupedSelections.some(
                          (g) => g.children.length > 0
                        ) && <OrSeparator />}
                        <SelectionChip>
                          <span className="pl-1 py-2 font-semibold text-foreground">
                            {optionLabel} =
                          </span>
                          {groupedSelections
                            .filter((g) => g.children.length === 0)
                            .map((group, index) => (
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
                  </div>
                </div>
              ) : (
                <div className="flex w-full items-center justify-between">
                  <span
                    className="mx-3 text-sm text-muted-foreground normal-case"
                    role="textbox"
                    aria-readonly="true">
                    {placeholder}
                  </span>
                  <KeyboardArrowDownIcon
                    className="mx-2 w-2.5 h-2.5 cursor-pointer text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
              )}
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
                <CommandEmpty>{noResultString}</CommandEmpty>
                <CommandGroup>
                  {flatOptions.map((option) => {
                    if (option.type === 'parent') {
                      const parentValue = option.value;
                      const checked = isParentFullySelected(parentValue);
                      const indeterminate =
                        isParentPartiallySelected(parentValue);

                      return (
                        <CommandItem
                          key={parentValue}
                          onSelect={() => toggleParent(parentValue)}
                          style={{ pointerEvents: 'auto', opacity: 1 }}
                          className="cursor-pointer">
                          <div className="mr-2 flex h-4 w-4 min-w-4 items-center justify-center rounded-sm border border-primary bg-background text-primary-foreground">
                            {checked ? (
                              <CheckIcon className="h-4 w-4 bg-primary" />
                            ) : indeterminate ? (
                              <div className="h-2 w-2 rounded-sm bg-primary" />
                            ) : null}
                          </div>
                          <span>{option.label}</span>
                        </CommandItem>
                      );
                    }

                    const childValue = option.value;
                    const parentValue = option.parentValue;
                    const isSelected = isChildSelected(parentValue, childValue);

                    return (
                      <CommandItem
                        key={`${parentValue}-${childValue}`}
                        onSelect={() => toggleChild(childValue, parentValue)}
                        style={{ pointerEvents: 'auto', opacity: 1 }}
                        className="cursor-pointer pl-6">
                        {isSelected ? (
                          <div className="mr-2 flex h-4 w-4 min-w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                            <CheckIcon className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="mr-2 flex h-4 w-4 min-w-4 items-center justify-center rounded-sm border border-primary opacity-50" />
                        )}
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <div className="flex items-center justify-between">
                    {groupedSelections.length > 0 && (
                      <>
                        <CommandItem
                          onSelect={handleClearAll}
                          style={{ pointerEvents: 'auto', opacity: 1 }}
                          className="flex-1 cursor-pointer justify-center">
                          Clear
                        </CommandItem>
                        <Separator
                          orientation="vertical"
                          className="flex h-full min-h-6"
                        />
                      </>
                    )}
                    <CommandItem
                      onSelect={() => setIsPopoverOpen(false)}
                      style={{ pointerEvents: 'auto', opacity: 1 }}
                      className="flex-1 cursor-pointer justify-center">
                      Close
                    </CommandItem>
                  </div>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    );
  }
);

LogicalMultiSelectFormField.displayName = 'LogicalMultiSelectFormField';

export { AndSeparator, LogicalMultiSelectFormField, OrSeparator };
export type { Selection as LogicalMultiSelectSelection };
