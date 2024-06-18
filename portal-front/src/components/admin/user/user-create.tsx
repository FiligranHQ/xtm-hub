import * as React from 'react';
import { FunctionComponent, useState } from 'react';
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
      trigger={
        <Button
          size="icon"
          className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
          <AddIcon className="h-4 w-4" />
        </Button>
      }></UserFormSheet>
  );
};
