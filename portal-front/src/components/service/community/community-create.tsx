import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { z } from 'zod';
import { AddIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { useToast } from 'filigran-ui/clients';
import { CommunityFormSheet } from '@/components/service/community/community-form-sheet';
import { communityFormSchema } from '@/components/service/community/community-form-schema';
import { ServiceCommunityListCreateMutation } from '@/components/service/service.graphql';
import { serviceCommunityListMutation } from '../../../../__generated__/serviceCommunityListMutation.graphql';
import { useMutation } from 'react-relay';

interface CreateCommunityProps {
  connectionId: string;
}

export const CreateCommunity: FunctionComponent<CreateCommunityProps> = ({
  connectionId,
}) => {
  const [openSheet, setOpenSheet] = useState(false);

  const { toast } = useToast();
  const [commitServiceCommunityMutation] =
    useMutation<serviceCommunityListMutation>(
      ServiceCommunityListCreateMutation
    );

  const handleSubmit = (values: z.infer<typeof communityFormSchema>) => {
    commitServiceCommunityMutation({
      variables: {
        input: { ...(values as z.infer<typeof communityFormSchema>) },
        connections: [connectionId],
      },
      onCompleted: () => {},
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: <>{error.message}</>,
        });
      },
    });
    setOpenSheet(false);
  };
  return (
    <CommunityFormSheet
      title={'Create a new community'}
      description={
        'Create the community here. Click Validate when you are done.'
      }
      handleSubmit={handleSubmit}
      open={openSheet}
      setOpen={setOpenSheet}
      validationSchema={communityFormSchema}
      trigger={
        <Button
          size="icon"
          className="absolute bottom-4 right-4 z-10 rounded-3xl drop-shadow-xl">
          <AddIcon className="h-4 w-4" />
        </Button>
      }></CommunityFormSheet>
  );
};
