import * as React from 'react';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
  useSubscription,
} from 'react-relay';
import { pageLoaderUserSlugQuery } from '../../../../../__generated__/pageLoaderUserSlugQuery.graphql';
import { UserSlugQuery } from '../../../../../app/(application)/(admin)/admin/user/[slug]/page-loader';
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
  userSlugSubscription,
} from '@/components/admin/user/user.graphql';
import { Button } from 'filigran-ui/servers';
import { UserEditSheet } from '@/components/admin/user/[slug]/user-edit-sheet';
import { DataTracking } from '@/components/data-tracking/data-tracking';
import { dataTracking_fragment$key } from '../../../../../__generated__/dataTracking_fragment.graphql';
import { trackingSubscription } from '@/components/data-tracking/tracking.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { DeleteIcon } from 'filigran-icon';

// Component interface
interface UserSlugProps {
  queryRef: PreloadedQuery<pageLoaderUserSlugQuery>;
}

// Component
const UserSlug: React.FunctionComponent<UserSlugProps> = ({ queryRef }) => {
  const router = useRouter();
  const data = usePreloadedQuery<pageLoaderUserSlugQuery>(
    UserSlugQuery,
    queryRef
  );
  const [deleteUserMutation] =
    useMutation<userSlugDeletionMutation>(userSlugDeletion);
  const user = useFragment<userSlug_fragment$key>(userSlugFragment, data.user);

  const onDeleteUser = (user: userSlug_fragment$data): void => {
    deleteUserMutation({
      variables: { id: user.id },
      onCompleted: () => {
        router.replace('/admin/user');
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
            data={data.user?.tracking_data as dataTracking_fragment$key}
          />
        </div>
        <UserEditSheet user={user} />
      </>
    );
  }
};

// Component export
export default UserSlug;
