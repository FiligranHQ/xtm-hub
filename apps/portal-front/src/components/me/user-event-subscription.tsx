'use client';

import { LogoutMutation } from '@/components/logout.graphql';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';
import { GraphQLSubscriptionConfig } from 'relay-runtime';

import { userMeSubscription } from '@/components/admin/user/user.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import {
  userMeSubscription$data,
  userMeSubscription as userMeSubscriptionType,
} from '@generated/userMeSubscription.graphql';
import { useMutation, useSubscription } from 'react-relay';

// Component
const UserEventSubscription: React.FunctionComponent = () => {
  const [commitLogoutMutation] = useMutation(LogoutMutation);
  const t = useTranslations();

  const router = useRouter();

  const logout = () => {
    commitLogoutMutation({
      variables: {},
      updater: (store) => {
        store.invalidateStore();
      },
      onCompleted() {
        router.push('/?error=account-deleted');
        router.refresh();
      },
    });
  };

  const [isOpen, setIsOpen] = useState(false);
  const subscriptionConfig: GraphQLSubscriptionConfig<userMeSubscriptionType> =
    {
      subscription: userMeSubscription,
      variables: {},
      onNext: (data: userMeSubscription$data | null | undefined) => {
        if (data?.MeUser?.edit) {
          setIsOpen(true);
        } else if (data?.MeUser?.delete) {
          logout();
        }
      },
    };
  useSubscription(subscriptionConfig);
  return (
    <AlertDialogComponent
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      AlertTitle={t('UpdateUserDialog.TextUpdatedUserTitle')}
      onClickContinue={() => {}}
      displayCancelButton={false}
      actionButtonText={t('Utils.Continue')}>
      <p>{t('UpdateUserDialog.TextUpdatedUser')}</p>
    </AlertDialogComponent>
  );
};

// Component export
export default UserEventSubscription;
