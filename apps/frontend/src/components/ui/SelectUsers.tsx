import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { UserFragment } from '@/components/admin/user/UserList';
import { useUsersList } from '@/hooks/use-users-list';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { MultiSelectFormField } from '@filigran/ui/clients';
import { UserList_fragment$key } from '@generated/UserList_fragment.graphql';
import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo, useState } from 'react';
import { readInlineData } from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';

interface SelectUsersFormFieldProps {
  defaultValue?: string;
  value?: string;
  defaultLabel?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const SelectUsersFormField = React.forwardRef<
  HTMLButtonElement,
  SelectUsersFormFieldProps
>(({ defaultValue, value, defaultLabel, onValueChange, disabled }, ref) => {
  const t = useTranslations();
  const { orderMode, orderBy } = useUserListLocalstorage();

  const { data, refetch } = useUsersList({
    orderBy,
    orderMode,
    pageSize: 50,
    filter: {
      search: '',
    },
  });

  const options = useMemo(
    () =>
      data?.users?.edges?.map((edge) => {
        const user = readInlineData<UserList_fragment$key>(
          UserFragment,
          edge.node
        );
        return {
          value: user.id,
          label: user.email,
        };
      }) ?? [],
    [data?.users?.edges]
  );

  const [labelCache, setLabelCache] = useState<Record<string, string>>(() =>
    defaultValue && defaultLabel ? { [defaultValue]: defaultLabel } : {}
  );

  const resolveLabel = useCallback(
    (val: string): string | undefined =>
      options.find((opt) => opt.value === val)?.label ?? labelCache[val],
    [options, labelCache]
  );

  const handleRefetch = useCallback(
    (searchTerm: string) => {
      refetch({
        count: 10,
        orderMode,
        orderBy,
        searchTerm,
      });
    },
    [refetch, orderMode, orderBy]
  );

  const handleSearchInputChange = useDebounceCallback(
    handleRefetch,
    DEBOUNCE_TIME
  );

  const handleValueChange = useCallback(
    (values: string[]) => {
      const next = values[0] ?? '';
      const picked = options.find((opt) => opt.value === next);
      if (picked) {
        setLabelCache((cache) => ({ ...cache, [picked.value]: picked.label }));
      }
      onValueChange(next);
    },
    [options, onValueChange]
  );

  return (
    <MultiSelectFormField
      ref={ref}
      mode="single"
      shouldFilter={false}
      disabled={disabled}
      options={options}
      keyValue="value"
      keyLabel="label"
      value={value !== undefined ? (value ? [value] : []) : undefined}
      defaultValue={defaultValue ? [defaultValue] : []}
      resolveLabel={resolveLabel}
      onValueChange={handleValueChange}
      onInputChange={handleSearchInputChange}
      placeholder={t('InviteUserServiceForm.Email')}
      searchPlaceholder={t('UserActions.SearchUser')}
      noResultString={t('Utils.NotFound')}
      clearLabel={t('Utils.Clear')}
      closeLabel={t('Utils.Close')}
      clearAllAriaLabel={t('SelectUsers.ClearAllSelections')}
    />
  );
});
SelectUsersFormField.displayName = 'SelectUsersFormField';
export default SelectUsersFormField;