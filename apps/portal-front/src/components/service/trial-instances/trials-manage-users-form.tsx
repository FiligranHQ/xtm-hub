'use client';
import { UserFragment } from '@/components/admin/user/user-list';
import { useUserListLocalstorage } from '@/components/admin/user/user-list-localstorage';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { useUsersList } from '@/hooks/useUsersList';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { userList_fragment$key } from '@generated/userList_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  SheetFooter,
} from 'filigran-ui';
import { MultiSelectFormField } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { readInlineData } from 'react-relay';
import { z } from 'zod';

interface Props {
  platform: registeredPlatformByServiceInstanceId_fragment$data;
}

const formSchema = z.object({
  groups: z.array(
    z.object({
      name: z.string().min(1),
      userIds: z.array(z.string().min(1)),
    })
  ),
});

export const TrialsManageUsersForm: React.FC<Props> = ({ platform }) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(true);
  const { orderMode, orderBy, pageSize } = useUserListLocalstorage();
  const { data: availableUsers } = useUsersList({
    orderMode,
    orderBy,
    pageSize,
    filter: { organization: platform.subscription?.organization?.id },
  });

  const options = useMemo(() => {
    return availableUsers.users.edges.map(({ node }) => {
      const { email, id } = readInlineData<userList_fragment$key>(
        UserFragment,
        node
      );
      return {
        label: email,
        value: id,
      };
    });
  }, [availableUsers.users.edges]);

  const groups = useMemo(() => {
    return [
      {
        name: 'Admin',
        users: [],
      },
      {
        name: 'Analyst',
        users: [],
      },
      {
        name: 'Reader',
        users: [],
      },
    ];
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groups,
    },
  });

  const groupFields = useMemo(() => {
    return groups.map((group, index) => (
      <FormField
        key={group.name}
        control={form.control}
        render={({ field: { value, onChange } }) => {
          return (
            <FormItem>
              <FormLabel>{group.name}</FormLabel>
              <MultiSelectFormField
                options={options}
                defaultValue={value}
                placeholder={t('Service.Trials.ManageUsers.Email')}
                noResultString={t('Utils.NotFound')}
                onValueChange={onChange}
                variant="inverted"
              />
            </FormItem>
          );
        }}
        name={`groups.${index}.userIds`}
      />
    ));
  }, [groups, form.control, t, options]);

  return (
    <SheetWithPreventingDialog
      title={t('Service.Trials.ManageUsers.Title')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={
        <Button variant="outline-primary">
          {t('Service.Trials.ManageUsers.Title')}
        </Button>
      }>
      <Form {...form}>
        <form className="w-full space-y-xl">
          {groupFields}
          <SheetFooter>
            <div className="flex gap-s">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpenSheet(false)}>
                {t('Utils.Cancel')}
              </Button>
              <Button
                disabled={!form.formState.isDirty}
                type="submit">
                {t('Utils.Validate')}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </Form>
    </SheetWithPreventingDialog>
  );
};
