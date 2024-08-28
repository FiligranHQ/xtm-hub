import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { UserSlugEditMutation } from '@/components/admin/user/user.graphql';
import { userEditFormSchema } from '@/components/admin/user/user-form.schema';
import { UserFormSheet } from '@/components/admin/user/user-form-sheet';
import { EditIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { useToast } from 'filigran-ui/clients';
import { userSlugEditMutation } from '../../../../../__generated__/userSlugEditMutation.graphql';
import { userSlug_fragment$data } from '../../../../../__generated__/userSlug_fragment.graphql';
import TriggerButton from '@/components/ui/trigger-button';

interface EditUserProps {
  user: userSlug_fragment$data;
}

export const EditUser: FunctionComponent<EditUserProps> = ({ user }) => {
  const [openSheet, setOpenSheet] = useState(false);

  const { toast } = useToast();
  const [commitUserMutation] =
    useMutation<userSlugEditMutation>(UserSlugEditMutation);

  const handleSubmit = (values: z.infer<typeof userEditFormSchema>) => {
    const { password, ...valuesWithoutPasswordField } = values;
    commitUserMutation({
      variables: { input: { ...valuesWithoutPasswordField }, id: user.id },
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
      title={'Edit user'}
      description={'Edit the profile here. Click Validate when you are done.'}
      handleSubmit={handleSubmit}
      open={openSheet}
      setOpen={setOpenSheet}
      user={user}
      validationSchema={userEditFormSchema}
      trigger={
        <TriggerButton
          icon={<EditIcon className="mr-2 h-4 w-4" />}
          label="Edit"
        />
      }></UserFormSheet>
  );
};
