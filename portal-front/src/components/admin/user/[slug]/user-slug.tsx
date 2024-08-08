import * as React from 'react';
import { useCallback } from 'react';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
  useSubscription,
} from 'react-relay';
import {
  userSlug_fragment$data,
  userSlug_fragment$key,
} from '../../../../../__generated__/userSlug_fragment.graphql';
import { useRouter } from 'next/navigation';
import { userSlugDeletionMutation } from '../../../../../__generated__/userSlugDeletionMutation.graphql';

import { userSlugSubscription as generatedUserSlugSubscription } from '../../../../../__generated__/userSlugSubscription.graphql';
import {
  userSlugDeletion,
  userSlugFragment,
  UserSlugQuery,
  userSlugSubscription,
} from '@/components/admin/user/user.graphql';
import { Button } from 'filigran-ui/servers';
import { DataTracking } from '@/components/data-tracking/data-tracking';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { DeleteIcon } from 'filigran-icon';
import { useToast } from 'filigran-ui/clients';
import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import { trackingSubscription } from '@/components/data-tracking/tracking.graphql';
import { userSlugQuery } from '../../../../../__generated__/userSlugQuery.graphql';
import { trackingData_fragment$key } from '../../../../../__generated__/trackingData_fragment.graphql';

// Component interface
interface UserSlugProps {
  queryRef: PreloadedQuery<userSlugQuery>;
}

// Component
const UserSlug: React.FunctionComponent<UserSlugProps> = ({ queryRef }) => {
  const router = useRouter();
  const data = usePreloadedQuery<userSlugQuery>(UserSlugQuery, queryRef);

  const [deleteUserMutation] =
    useMutation<userSlugDeletionMutation>(userSlugDeletion);
  const user = useFragment<userSlug_fragment$key>(userSlugFragment, data.user);
  const { toast } = useToast();
  const onDeleteUser = (user: userSlug_fragment$data): void => {
    deleteUserMutation({
      variables: { id: user.id },
      onCompleted: () => {
        router.replace('/admin/user');
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

  useSubscription<generatedUserSlugSubscription>({
    variables: {},
    subscription: userSlugSubscription,
    onNext: (response) => {
      // In case of merge, redirect to the target merged user
      if (response?.User?.merge && response?.User?.merge.from === user?.id) {
        router.replace(`/admin/user/${response?.User?.merge?.target}`);
      }
    },
  });
  useSubscription<generatedUserSlugSubscription>({
    variables: {},
    subscription: trackingSubscription,
  });

  if (!user) {
    // If user not found, redirect to admin list
    router.replace('/admin/user');
  } else {
    const breadcrumbValue = [
      {
        href: '/',
        label: 'Home',
      },
      {
        href: '/admin/user',
        label: 'Users',
      },
      {
        label: user.email,
      },
    ];
    return (
      <>
        <BreadcrumbNav value={breadcrumbValue} />

        <div className="m-2 flex justify-between">
          <h2 className="text-xl">
            {user.first_name} {user.last_name} ({user.organization.name}) -{' '}
            {user.email}
          </h2>

          <AlertDialogComponent
            AlertTitle={'Delete user'}
            actionButtonText={'Delete'}
            variantName={'destructive'}
            triggerElement={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete User">
                <DeleteIcon className="h-4 w-4" />
              </Button>
            }
            onClickContinue={() => onDeleteUser(user)}>
            Are you sure you want to delete this user {user.first_name}{' '}
            {user.last_name} ?
          </AlertDialogComponent>
        </div>

        <div className="container mx-auto py-10">
          <DataTracking
            data={data.user?.tracking_data as trackingData_fragment$key}
          />
        </div>
        <EditUser user={user}></EditUser>
      </>
    );
  }
};

// Component export
export default UserSlug;
