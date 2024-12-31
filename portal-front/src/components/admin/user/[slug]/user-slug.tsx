import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import {
  userDeletion,
  userSlugFragment,
  UserSlugQuery,
  userSlugSubscription,
} from '@/components/admin/user/user.graphql';
import { trackingSubscription } from '@/components/data-tracking/tracking.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { DeleteIcon } from 'filigran-icon';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useRelayEnvironment } from 'react-relay';

import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { useConnectionId } from '@/hooks/useConnectionId';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
  useSubscription,
} from 'react-relay';
import { userDeletionMutation } from '../../../../../__generated__/userDeletionMutation.graphql';
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
  const [deleteUserMutation] = useMutation<userDeletionMutation>(userDeletion);
  const user = useFragment<userSlug_fragment$key>(userSlugFragment, data.user);

  const { toast } = useToast();
  const connections: string[] = [];
  const connectionID = useConnectionId('UserConnection');
  if (connectionID) {
    connections.push(connectionID);
  } else {
    console.warn('recovered ConnectionID from UserConnection is empty');
    logFrontendError(
      useRelayEnvironment(),
      '[user-slug] - Recovered ConnectionID from UserConnection is empty'
    );
  }

  const onDeleteUser = (user: userSlug_fragment$data): void => {
    deleteUserMutation({
      variables: { id: user.id, connections },
      onCompleted: () => {
        router.replace('/admin/user');
        toast({
          title: t('Utils.Success'),
          description: t('UserActions.UserDeleted'),
        });
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t('Error.User.DeleteUser'),
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
                  <DeleteIcon
                    aria-hidden={true}
                    focusable={false}
                    className="h-4 w-4"
                  />
                </Button>
              }
              onClickContinue={() => onDeleteUser(user)}>
              {t('DeleteUserDialog.TextDeleteThisUser', {
                email: user.email,
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
