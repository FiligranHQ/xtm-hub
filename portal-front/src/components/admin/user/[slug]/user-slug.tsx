import { useRouter } from 'next/navigation';
import * as React from 'react';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
  useSubscription,
} from 'react-relay';
import { userSlugDeletionMutation } from '../../../../../__generated__/userSlugDeletionMutation.graphql';

import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import {
  userSlugDeletion,
  userSlugFragment,
  UserSlugQuery,
  userSlugSubscription,
} from '@/components/admin/user/user.graphql';
import { trackingSubscription } from '@/components/data-tracking/tracking.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { DeleteIcon } from 'filigran-icon';
import { useToast } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { userSlugQuery } from '../../../../../__generated__/userSlugQuery.graphql';
import { userSlugSubscription as generatedUserSlugSubscription } from '../../../../../__generated__/userSlugSubscription.graphql';
import {
  userSlug_fragment$data,
  userSlug_fragment$key,
} from '../../../../../__generated__/userSlug_fragment.graphql';

// Component interface
interface UserSlugProps {
  queryRef: PreloadedQuery<userSlugQuery>;
}

// Component
const UserSlug: React.FunctionComponent<UserSlugProps> = ({ queryRef }) => {
  const router = useRouter();
  const data = usePreloadedQuery<userSlugQuery>(UserSlugQuery, queryRef);

  const t = useTranslations();
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
          title: t('Utils.Error'),
          description: <>{error.message}</>,
        });
      },
    });
  };

  useSubscription<generatedUserSlugSubscription>({
    variables: {},
    subscription: userSlugSubscription,
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
        label: t('MenuLinks.Settings'),
      },
      {
        href: '/admin/user',
        label: t('MenuLinks.Users'),
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
            {user.first_name} {user.last_name} - {user.email}
          </h2>
          <div className="space-x-2 flex items-center">
            <EditUser user={user} />
            <AlertDialogComponent
              AlertTitle={t('UserActions.DeleteUser')}
              actionButtonText={t('MenuActions.Delete')}
              variantName={'destructive'}
              triggerElement={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('UserActions.DeleteUser')}>
                  <DeleteIcon className="h-4 w-4" />
                </Button>
              }
              onClickContinue={() => onDeleteUser(user)}>
              {t('DeleteUserDialog.TextDeleteThisUser', {
                first_name: user.first_name,
                last_name: user.last_name,
              })}
            </AlertDialogComponent>
          </div>
        </div>
      </>
    );
  }
};

// Component export
export default UserSlug;
