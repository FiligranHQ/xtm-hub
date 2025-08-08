import { EditUser } from '@/components/admin/user/[slug]/user-edit';
import {
  UserSlugEditMutation,
  userSlugFragment,
  UserSlugQuery,
  userSlugSubscription,
} from '@/components/admin/user/user.graphql';
import { trackingSubscription } from '@/components/data-tracking/tracking.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { userSlugSubscription as generatedUserSlugSubscription } from '@generated/userSlugSubscription.graphql';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import {
  PreloadedQuery,
  useFragment,
  useMutation,
  usePreloadedQuery,
  useRelayEnvironment,
  useSubscription,
} from 'react-relay';

import { logFrontendError } from '@/components/error-frontend-log.graphql';
import { useConnectionId } from '@/hooks/useConnectionId';
import { APP_PATH } from '@/utils/path/constant';
import { userList_fragment$key } from '@generated/userList_fragment.graphql';
import { userSlugQuery } from '@generated/userSlugQuery.graphql';

// Component interface
interface UserSlugProps {
  queryRef: PreloadedQuery<userSlugQuery>;
}

// Component
const UserSlug: React.FunctionComponent<UserSlugProps> = ({ queryRef }) => {
  const router = useRouter();
  const data = usePreloadedQuery<userSlugQuery>(UserSlugQuery, queryRef);

  const t = useTranslations();
  const user = useFragment<userList_fragment$key>(userSlugFragment, data.user);

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

  const [updateUserMutation] = useMutation(UserSlugEditMutation);
  const updateUser = (disabled: boolean) => {
    updateUserMutation({
      variables: {
        input: {
          disabled,
        },
        id: user!.id,
        userListConnections: [],
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
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
    router.replace(`/${APP_PATH}/admin/user`);
  } else {
    const breadcrumbValue = [
      {
        label: 'MenuLinks.Settings',
      },
      {
        href: `/${APP_PATH}/admin/user`,
        label: 'MenuLinks.Security',
      },
      {
        label: user.email,
        original: true,
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
            {user.disabled ? (
              <Button
                variant="outline-primary"
                onClick={() => updateUser(false)}>
                {t('UserActions.Enable')}
              </Button>
            ) : (
              <AlertDialogComponent
                AlertTitle={t('UserActions.Disable')}
                actionButtonText={t('MenuActions.Disable')}
                variantName={'destructive'}
                triggerElement={
                  <Button variant="outline-destructive">
                    {t('UserActions.Disable')}
                  </Button>
                }
                onClickContinue={() => updateUser(true)}>
                {t('DisableUserDialog.TextDisableThisUser', {
                  email: user.email,
                })}
              </AlertDialogComponent>
            )}
            <EditUser
              user={user!}
              trigger={<Button>{t('Utils.Update')} </Button>}
            />
          </div>
        </div>
      </>
    );
  }
};

// Component export
export default UserSlug;
