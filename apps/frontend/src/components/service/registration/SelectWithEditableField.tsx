import { CheckIcon } from '@filigran/icon';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@filigran/ui';
import { Input } from '@filigran/ui/servers';
import { useRef, useState } from 'react';

type Option = { value: string; label: string };

interface SelectWithEditableFieldProps {
  onChange: (value: string) => void;
  options: Option[];
  labels: {
    placeholder: string;
    editableFieldLabel: string;
    editableFieldPlaceholder: string;
  };
  editableFieldValue: string;
}

const OTHER_VALUE = '__other__';

export const SelectWithEditableField = ({
  onChange,
  options,
  labels,
  editableFieldValue,
}: SelectWithEditableFieldProps) => {
  const [selectValue, setSelectValue] = useState<string>('');
  const [customValue, setCustomValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const committedValueRef = useRef<string>('');

  const handleSelectChange = (v: string) => {
    if (!v && committedValueRef.current) {
      return;
    }

    setSelectValue(v);
    setCustomValue('');

    if (v === OTHER_VALUE) {
      committedValueRef.current = editableFieldValue;
      onChange(editableFieldValue);
    } else {
      committedValueRef.current = '';
      onChange(v);
    }

    setOpen(false);
  };

  const handleOtherClick = () => {
    setSelectValue(OTHER_VALUE);
    committedValueRef.current = editableFieldValue;
    onChange(editableFieldValue);

    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();

    if (e.key === 'Enter') {
      e.preventDefault();

      const trimmed = customValue.trim();
      const valueToCommit = trimmed
        ? `${editableFieldValue}: ${trimmed}`
        : editableFieldValue;

      committedValueRef.current = valueToCommit;
      setSelectValue(OTHER_VALUE);
      setCustomValue(trimmed);
      onChange(valueToCommit);
      setOpen(false);
    }
  };

  const selectedOption = options.find((o) => o.value === selectValue);
  const isOtherMode = selectValue === OTHER_VALUE;

  const triggerText = isOtherMode
    ? customValue || labels.editableFieldLabel
    : selectedOption?.label;

  return (
    <Select
      value={selectValue}
      onValueChange={handleSelectChange}
      open={open}
      onOpenChange={setOpen}>
      <SelectTrigger>
        <span className={triggerText ? '' : 'text-muted-foreground'}>
          {triggerText || labels.placeholder}
        </span>
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}>
            {option.label}
          </SelectItem>
        ))}

        <div
          className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
          onClick={handleOtherClick}>
          {isOtherMode && (
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <CheckIcon className="h-4 w-4" />
            </span>
          )}
          {labels.editableFieldLabel}
        </div>

        <div className="px-2 pb-2 pl-8">
          <Input
            ref={inputRef}
            value={customValue}
            onChange={handleCustomChange}
            onKeyDown={handleCustomKeyDown}
            placeholder={labels.editableFieldPlaceholder}
          />
        </div>
      </SelectContent>
    </Select>
  );
};
