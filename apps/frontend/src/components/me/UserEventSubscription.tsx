'use client';
import { LogoutMutation } from '@/components/logout.graphql';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GraphQLSubscriptionConfig } from 'relay-runtime';

import { userMeSubscription } from '@/components/admin/user/user.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import {
  userMeSubscription$data,
  userMeSubscription as userMeSubscriptionType,
} from '@generated/userMeSubscription.graphql';
import { useMutation, useSubscription } from 'react-relay'; // Component

import { useTranslate } from '@tolgee/react';
// Component
const UserEventSubscription = () => {
  const [commitLogoutMutation] = useMutation(LogoutMutation);
  const { t } = useTranslate();

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
      AlertTitle={t('UpdateUserDialog_TextUpdatedUserTitle')}
      onClickContinue={() => {}}
      displayCancelButton={false}
      actionButtonText={t('Utils_Continue')}>
      <p>{t('UpdateUserDialog_TextUpdatedUser')}</p>
    </AlertDialogComponent>
  );
};

// Component export
export default UserEventSubscription;
