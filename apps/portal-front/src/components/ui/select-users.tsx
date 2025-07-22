import {
  UserFragment,
  userListFragment,
  UserListQuery,
} from '@/components/admin/user/user-list';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { userList_fragment$key } from '@generated/userList_fragment.graphql';
import { userList_users$key } from '@generated/userList_users.graphql';
import { userListQuery } from '@generated/userListQuery.graphql';
import { CheckIcon, CloseIcon, KeyboardArrowDownIcon } from 'filigran-icon';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'filigran-ui/clients';
import { Badge, Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  readInlineData,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';

interface SelectUsersFormFieldProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  defaultValue?: string;
  onValueChange: (value: string) => void;
}

const SelectUsersFormField = React.forwardRef<
  HTMLButtonElement,
  SelectUsersFormFieldProps
>(({ defaultValue, onValueChange, ...props }, ref) => {
  const t = useTranslations();

  const [selectedValues, setSelectedValues] = useState<string[]>([
    defaultValue ?? '',
  ]);

  const selectedValuesSet = useRef(new Set(selectedValues));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [visibleBadges, setVisibleBadges] = useState<number>(
    selectedValues.length
  );
  const badgesContainerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);

  const updateBadgeVisibility = useCallback(() => {
    if (!badgesContainerRef.current || !measurementRef.current) {
      return;
    }

    const container = badgesContainerRef.current;
    const measurementContainer = measurementRef.current;

    const containerWidth = container.offsetWidth - 10; // Save space for controls

    let totalWidth = 0;
    let lastVisibleIndex = 0;

    const children = Array.from(measurementContainer.children) as HTMLElement[];

    for (let i = 0; i < selectedValues.length; i++) {
      const child = children[i];
      if (child) {
        const childWidth = child.offsetWidth + 4; // 4px for gap
        const overflowBadgeLength = 56;

        if (totalWidth + childWidth + overflowBadgeLength > containerWidth) {
          break;
        }

        totalWidth += childWidth;
        lastVisibleIndex = i + 1;
      }
    }

    setVisibleBadges(lastVisibleIndex);
  }, [selectedValues, badgesContainerRef, measurementRef, setVisibleBadges]);

  useEffect(() => {
    updateBadgeVisibility();

    const handleResize = () => updateBadgeVisibility();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedValues, updateBadgeVisibility]);

  const { orderMode, orderBy } = useUserListLocalstorage();
  const filterRef = useRef({ search: '' });

  const queryData = useLazyLoadQuery<userListQuery>(UserListQuery, {
    count: 50,
    orderMode,
    orderBy,
    searchTerm: filterRef.current.search,
  });
  const [data, refetch] = useRefetchableFragment<
    userListQuery,
    userList_users$key
  >(userListFragment, queryData);
  const users =
    data?.users?.edges?.map((edge) => {
      const user = readInlineData<userList_fragment$key>(
        UserFragment,
        edge.node
      );
      return {
        value: user.id,
        label: user.email,
      };
    }) || [];

  const handleRefetch = (value: string) => {
    filterRef.current = {
      ...filterRef.current,
      search: value,
    };

    refetch({
      count: 10,
      orderMode,
      orderBy,
      searchTerm: filterRef.current.search,
    });
  };

  const handleSearchInputChange = useDebounceCallback(
    (e) => handleRefetch(e.target.value),
    DEBOUNCE_TIME
  );

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement;
    if (event.key === 'Enter') {
      setIsPopoverOpen(true);
    } else if (event.key === 'Backspace' && !target.value) {
      if (selectedValues.length > 0) {
        const newValues = [...selectedValues];
        const lastValue = newValues.pop() || '';
        setSelectedValues(newValues);
        selectedValuesSet.current.delete(lastValue);
        onValueChange(newValues[0] ?? '');
      }
    }
  };

  const toggleOption = (value: string) => {
    if (selectedValuesSet.current.has(value)) {
      selectedValuesSet.current.clear();
      setSelectedValues([]);
      onValueChange('');
    } else {
      selectedValuesSet.current = new Set([value]);
      setSelectedValues([value]);
      onValueChange(value);
      setIsPopoverOpen(false);
    }
  };

  const hiddenCount = selectedValues.length - visibleBadges;

  const renderBadges = (values: string[]) =>
    values.map((value) => {
      const option = users.find((opt) => String(opt.value) === value);
      return (
        <Badge key={value}>
          {option ? String(option.label) : value}
          <span
            className="ml-s flex items-center justify-center"
            onClick={(event) => {
              event.stopPropagation();
              toggleOption(value);
            }}
            aria-label={`Remove ${option ? String(option.label) : value}`}>
            <CloseIcon className="h-3 w-3 cursor-pointer" />
          </span>
        </Badge>
      );
    });

  const memoizedBadgesMeasurement = useMemo(() => {
    return renderBadges(selectedValues);
  }, [selectedValues, visibleBadges, users, 'label', 'value', toggleOption]);

  const memoizedBadges = useMemo(() => {
    return renderBadges(selectedValues.slice(0, visibleBadges));
  }, [selectedValues, visibleBadges, users, 'label', 'value', toggleOption]);

  const memoizedBadgesTooltip = useMemo(() => {
    return renderBadges(selectedValues.slice(visibleBadges));
  }, [selectedValues, visibleBadges, users, 'label', 'value', toggleOption]);

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
            className="flex h-9 w-full items-center justify-between rounded border border-input bg-inherit p-1 hover:bg-hover">
            {selectedValues.length > 0 ? (
              <div className="flex w-full items-center">
                <div
                  ref={badgesContainerRef}
                  className="flex flex-1 items-center gap-s overflow-hidden">
                  <div
                    ref={measurementRef}
                    className="absolute invisible flex items-center gap-s"
                    aria-hidden="true">
                    {memoizedBadgesMeasurement}
                  </div>

                  {memoizedBadges}

                  {hiddenCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex">
                          <Badge>+{hiddenCount}...</Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="flex flex-wrap gap-s p-s max-w-sm">
                          {memoizedBadgesTooltip}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center flex-shrink-0">
                  <button
                    type="button"
                    className="flex items-center justify-center"
                    onClick={(event) => {
                      setSelectedValues([]);
                      selectedValuesSet.current.clear();
                      onValueChange('');
                      event.stopPropagation();
                    }}
                    aria-label="Clear all selections">
                    <CloseIcon className="mx-s h-3 cursor-pointer text-muted-foreground" />
                  </button>
                  <Separator
                    orientation="vertical"
                    className="h-6"
                  />
                  <KeyboardArrowDownIcon className="mx-2 w-2.5 h-2.5 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between">
                <span
                  className="mx-3 text-sm text-muted-foreground normal-case"
                  role="textbox"
                  aria-readonly="true">
                  {'Email'}
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
          <Command
            shouldFilter={false}
            onChange={handleSearchInputChange}>
            <CommandInput
              placeholder="Search user..."
              onKeyDown={handleInputKeyDown}
            />
            <CommandList>
              <CommandEmpty>{t('Utils.NotFound')}</CommandEmpty>
              <CommandGroup>
                {users.map((option) => {
                  const optionValue = String(option.value);
                  const isSelected = selectedValuesSet.current.has(optionValue);
                  return (
                    <CommandItem
                      key={optionValue}
                      onSelect={() => toggleOption(optionValue)}
                      style={{
                        pointerEvents: 'auto',
                        opacity: 1,
                      }}
                      className="cursor-pointer">
                      {isSelected ? (
                        <div className="mr-2 flex h-4 w-4 min-w-4 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground">
                          <CheckIcon className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="mr-2 flex h-4 w-4 min-w-4 items-center justify-center rounded-sm border border-primary opacity-50"></div>
                      )}
                      <span>{String(option.label)}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <div className="flex items-center justify-between">
                  {selectedValues.length > 0 && (
                    <>
                      <CommandItem
                        onSelect={() => {
                          setSelectedValues([]);
                          selectedValuesSet.current.clear();
                          onValueChange('');
                        }}
                        style={{
                          pointerEvents: 'auto',
                          opacity: 1,
                        }}
                        className="flex-1 cursor-pointer justify-center uppercase">
                        {t('Utils.Clear')}
                      </CommandItem>
                      <Separator
                        orientation="vertical"
                        className="flex h-full min-h-6"
                      />
                    </>
                  )}
                  <CommandSeparator />
                  <CommandItem
                    onSelect={() => setIsPopoverOpen(false)}
                    style={{
                      pointerEvents: 'auto',
                      opacity: 1,
                    }}
                    className="flex-1 cursor-pointer justify-center uppercase">
                    {t('Utils.Close')}
                  </CommandItem>
                </div>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
});
SelectUsersFormField.displayName = 'SelectUsersFormField';
export default SelectUsersFormField;
