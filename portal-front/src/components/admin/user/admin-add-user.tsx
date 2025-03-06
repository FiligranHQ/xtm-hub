import { UserAdminForm } from '@/components/admin/user/user-admin-form';
import { userAdminFormSchema } from '@/components/admin/user/user-form.schema';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import TriggerButton from '@/components/ui/trigger-button';
import { adminAddUserMutation } from '@generated/adminAddUserMutation.graphql';
import { useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { z } from 'zod';

interface AdminAddUserProps {
  connectionId: string;
}

export const AdminAddUserMutation = graphql`
  mutation adminAddUserMutation(
    $input: AdminAddUserInput!
    $connections: [ID!]!
  ) {
    adminAddUser(input: $input)
      @prependNode(connections: $connections, edgeTypeName: "UserEdge") {
      ...userList_fragment
    }
  }
`;

export const AdminAddUser: FunctionComponent<AdminAddUserProps> = ({
  connectionId,
}) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const { toast } = useToast();
  const [commitUserMutation] =
    useMutation<adminAddUserMutation>(AdminAddUserMutation);

  const handleSubmit = (values: z.infer<typeof userAdminFormSchema>) => {
    commitUserMutation({
      variables: {
        input: {
          ...values,
        },
        connections: [connectionId],
      },
      onCompleted: () => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('UserActions.UserCreated', { email: values.email }),
        });
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

  return (
    <SheetWithPreventingDialog
      title={t('UserActions.AddUser')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={<TriggerButton label={t('UserActions.AddUser')} />}>
      <UserAdminForm handleSubmit={handleSubmit} />
    </SheetWithPreventingDialog>
  );
};
