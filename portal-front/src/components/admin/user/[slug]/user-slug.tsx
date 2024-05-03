import * as React from 'react';
import { PreloadedQuery, useFragment, useMutation, usePreloadedQuery, useSubscription } from 'react-relay';
import { pageLoaderUserSlugQuery } from '../../../../../__generated__/pageLoaderUserSlugQuery.graphql';
import { UserSlugQuery } from '../../../../../app/(application)/(admin)/admin/user/[slug]/page-loader';
import { userSlug_fragment$data, userSlug_fragment$key } from '../../../../../__generated__/userSlug_fragment.graphql';
import { useRouter } from 'next/navigation';
import { userSlugDeletionMutation } from '../../../../../__generated__/userSlugDeletionMutation.graphql';
import {
  userSlugSubscription as generatedUserSlugSubscription,
} from '../../../../../__generated__/userSlugSubscription.graphql';
import { userSlugDeletion, userSlugFragment, userSlugSubscription } from '@/components/admin/user/user.graphql';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Button } from 'filigran-ui/servers';
import { UserEditSheet } from '@/components/admin/user/[slug]/user-edit-sheet';
import { DataTracking } from '@/components/data-tracking/data-tracking';
import { dataTracking_fragment$key } from '../../../../../__generated__/dataTracking_fragment.graphql';

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

  const onDeleteUser = (user: userSlug_fragment$data) => {
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
  if (!user) {
    // If user not found, redirect to admin list
    router.replace('/admin/user');
  } else {
    return (
      <>
        <Breadcrumb className="pb-2">
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/user">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{user.email}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <div>
          <div>
            <b>Email</b> {user.email}
          </div>
          <div>
            <b>First name</b> {user.first_name}
          </div>
          <div>
            <b>Last name</b> {user.last_name}
          </div>
          <div>
            <b>Organization</b> {user.organization.name}
          </div>
        </div>
        <Button onClick={() => onDeleteUser(user)}>Delete</Button>
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
