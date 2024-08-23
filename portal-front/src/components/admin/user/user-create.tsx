import * as React from 'react';
import { FunctionComponent, useContext, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { userListCreateMutation } from '../../../../__generated__/userListCreateMutation.graphql';
import { UserListCreateMutation } from '@/components/admin/user/user.graphql';
import {
  userEditFormSchema,
  userFormSchema,
} from '@/components/admin/user/user-form.schema';
import { UserFormSheet } from '@/components/admin/user/user-form-sheet';
import { AddIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { useToast } from 'filigran-ui/clients';
import useGranted from '@/hooks/useGranted';
import { userSlug_fragment$data } from '../../../../__generated__/userSlug_fragment.graphql';
import { Portal, portalContext } from '@/components/portal-context';
import CreateButton from '@/components/ui/create-button';

interface CreateUserProps {
  connectionId: string;
}

export const CreateUser: FunctionComponent<CreateUserProps> = ({
  connectionId,
}) => {
  const [openSheet, setOpenSheet] = useState(false);

  const { toast } = useToast();
  const [commitUserMutation] = useMutation<userListCreateMutation>(
    UserListCreateMutation
  );
  const { me } = useContext<Portal>(portalContext);
  const isFullAdmin = useGranted('BYPASS');
  const user = {
    organization: {
      id: me?.organization.id,
    },
  } as userSlug_fragment$data;

  const handleSubmit = (
    values: z.infer<typeof userFormSchema> | z.infer<typeof userEditFormSchema>
  ) => {
    commitUserMutation({
      variables: {
        input: { ...(values as z.infer<typeof userFormSchema>) },
        connections: [connectionId],
      },
      onCompleted: () => {
        setOpenSheet(false);
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
  };
  return (
    <UserFormSheet
      title={'Create a new user'}
      description={'Create the profile here. Click Validate when you are done.'}
      handleSubmit={handleSubmit}
      open={openSheet}
      setOpen={setOpenSheet}
      validationSchema={userFormSchema}
      user={isFullAdmin ? undefined : user}
      trigger={<CreateButton label="Create user" />}></UserFormSheet>
  );
};
