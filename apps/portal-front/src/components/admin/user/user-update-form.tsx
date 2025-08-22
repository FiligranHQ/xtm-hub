import { CapabilityDescription } from '@/components/admin/user/capability-description';
import { RemoveUserFromOrga } from '@/components/admin/user/remove-user-from-orga';
import { userEditFormSchema } from '@/components/admin/user/user-form.schema';
import { getUserListContext } from '@/components/admin/user/user-list-page';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import { PortalContext } from '@/components/me/app-portal-context';
import { CapabilityMultiSelect } from '@/components/ui/capability/multi-select';
import { useDialogContext } from '@/components/ui/sheet-with-preventing-dialog';
import useAdminPath from '@/hooks/useAdminPath';
import { isEmpty } from '@/lib/utils';
import { userList_fragment$data } from '@generated/userList_fragment.graphql';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SheetFooter,
  toast,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-relay';
import { z } from 'zod';

interface UserUpdateFormProps {
  user: userList_fragment$data;
  callback: () => void;
}

export const UserUpdateForm: FunctionComponent<UserUpdateFormProps> = ({
  user,
  callback,
}) => {
  const { handleCloseSheet, setIsDirty } = useDialogContext();
  const { me } = useContext(PortalContext);
  const t = useTranslations();
  const isAdminPath = useAdminPath();

  const userOrg = user.organization_capabilities?.find(
    (org) => org.organization.id === me?.selected_organization_id
  );
  const form = useForm<z.infer<typeof userEditFormSchema>>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      capabilities: [...(userOrg?.capabilities ?? [])],
    },
  });

  // Some issue with addUser, the formState isDirty without any modification, so for now we check if dirtyFields get any key
  setIsDirty(!isEmpty(form.formState.dirtyFields));

  const [updateUserMutation] = useMutation(UserSlugEditMutation);

  const { connectionID } = getUserListContext();
  const updateUser = (values: z.infer<typeof userEditFormSchema>) => {
    const variables = isAdminPath
      ? values
      : { capabilities: values.capabilities };
    updateUserMutation({
      variables: {
        input: {
          ...variables,
        },
        id: user.id,
        userListConnections: [connectionID ?? ''],
      },
      onCompleted: () => {
        toast({
          title: t('Utils.Success'),
          description: t('UserActions.UserUpdated', { email: user.email }),
        });
        callback();
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  const onSubmit = (values: z.infer<typeof userEditFormSchema>) => {
    updateUser(values);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-xl">
        <CapabilityDescription />
        <FormField
          control={form.control}
          name="capabilities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('UserForm.OrganizationCapabilities')}</FormLabel>
              <FormControl>
                <CapabilityMultiSelect
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SheetFooter className="justify-between sm:justify-between pb-0">
          <RemoveUserFromOrga user={user} />
          <div className="flex gap-s">
            <Button
              variant="outline"
              type="button"
              onClick={(e) => handleCloseSheet(e)}>
              {t('Utils.Cancel')}
            </Button>
            <Button
              disabled={!form.formState.isValid}
              type="submit">
              {t('Utils.Validate')}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </Form>
  );
};
