import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { z } from 'zod';
import { useToast } from 'filigran-ui/clients';
import { CommunityFormSheet } from '@/components/service/community/community-form-sheet';
import {
  communityFormSchemaAdmin,
  communityFormSchemaOrga,
} from '@/components/service/community/community-form-schema';
import { ServiceCommunityListCreateMutation } from '@/components/service/service.graphql';
import { serviceCommunityListMutation } from '../../../../__generated__/serviceCommunityListMutation.graphql';
import { useMutation, useQueryLoader } from 'react-relay';
import { userQuery } from '../../../../__generated__/userQuery.graphql';
import { UserListQuery } from '@/components/admin/user/user.graphql';
import useMountingLoader from '@/hooks/useMountingLoader';
import Loader from '@/components/loader';
import TriggerButton from '@/components/ui/trigger-button';

interface CreateCommunityProps {
  connectionId: string;
  adminForm: boolean;
}

export const CreateCommunity: FunctionComponent<CreateCommunityProps> = ({
  connectionId,
  adminForm = false,
}) => {
  const [openSheet, setOpenSheet] = useState(false);

  const { toast } = useToast();
  const [commitServiceCommunityMutation] =
    useMutation<serviceCommunityListMutation>(
      ServiceCommunityListCreateMutation
    );

  const handleSubmit = (
    values: z.infer<
      typeof communityFormSchemaOrga | typeof communityFormSchemaAdmin
    >
  ) => {
    commitServiceCommunityMutation({
      variables: {
        input: {
          ...(values as z.infer<
            typeof communityFormSchemaOrga | typeof communityFormSchemaAdmin
          >),
        },
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

  const [queryRef, loadQuery] = useQueryLoader<userQuery>(UserListQuery);
  useMountingLoader(loadQuery, {
    count: 50,
    orderBy: 'email',
    orderMode: 'asc',
  });

  return queryRef ? (
    <CommunityFormSheet
      queryRef={queryRef}
      title={'Create a new community'}
      description={
        'Create the community here. Click Validate when you are done.'
      }
      handleSubmit={handleSubmit}
      open={openSheet}
      setOpen={setOpenSheet}
      adminForm={adminForm}
      trigger={<TriggerButton label="Create community" />}
    />
  ) : (
    <Loader />
  );
};
