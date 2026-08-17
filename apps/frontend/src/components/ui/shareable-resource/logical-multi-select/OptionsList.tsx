import {
  Checkbox,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  Separator,
} from '@filigran/ui';
import { useTranslate } from '@tolgee/react';
export type FlatOption =
  | { type: 'parent'; value: string; label: string }
  | { type: 'child'; value: string; label: string; parentValue: string };

interface OptionsListProps {
  flatOptions: FlatOption[];
  noResultString: string;
  isParentFullySelected: (parentValue: string) => boolean;
  isParentPartiallySelected: (parentValue: string) => boolean;
  isChildSelected: (parentValue: string, childValue: string) => boolean;
  toggleParent: (parentValue: string) => void;
  toggleChild: (childValue: string, parentValue: string) => void;
  onClear: () => void;
  onClose: () => void;
  showClear: boolean;
}

export const OptionsList = ({
  flatOptions,
  noResultString,
  isParentFullySelected,
  isParentPartiallySelected,
  isChildSelected,
  toggleParent,
  toggleChild,
  onClear,
  onClose,
  showClear,
}: OptionsListProps) => {
  const { t } = useTranslate();

  return (
    <>
      <CommandEmpty>{noResultString}</CommandEmpty>
      <CommandGroup>
        {flatOptions.map((option) => {
          if (option.type === 'parent') {
            const checked = isParentFullySelected(option.value);
            const indeterminate = isParentPartiallySelected(option.value);

            return (
              <CommandItem
                key={option.value}
                value={`parent:${option.value}`}
                onSelect={() => toggleParent(option.value)}
                style={{ pointerEvents: 'auto', opacity: 1 }}
                className="cursor-pointer">
                <Checkbox
                  checked={indeterminate ? 'indeterminate' : checked}
                  className="mr-2"
                />
                <span>{option.label}</span>
              </CommandItem>
            );
          }

          const isSelected = isChildSelected(option.parentValue, option.value);

          return (
            <CommandItem
              key={`${option.parentValue}-${option.value}`}
              value={`child:${option.parentValue}:${option.value}`}
              onSelect={() => toggleChild(option.value, option.parentValue)}
              style={{ pointerEvents: 'auto', opacity: 1 }}
              className="cursor-pointer pl-6">
              <Checkbox
                checked={isSelected}
                className="mr-2"
              />
              <span>{option.label}</span>
            </CommandItem>
          );
        })}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup>
        <div className="flex items-center justify-between">
          {showClear && (
            <>
              <CommandItem
                onSelect={onClear}
                style={{ pointerEvents: 'auto', opacity: 1 }}
                className="flex-1 cursor-pointer justify-center">
                {t('Utils_Clear')}
              </CommandItem>
              <Separator
                orientation="vertical"
                className="flex h-full min-h-6"
              />
            </>
          )}
          <CommandItem
            onSelect={onClose}
            style={{ pointerEvents: 'auto', opacity: 1 }}
            className="flex-1 cursor-pointer justify-center">
            {t('Utils_Close')}
          </CommandItem>
        </div>
      </CommandGroup>
    </>
  );
};
