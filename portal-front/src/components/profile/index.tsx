'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import {
  MeEditUserMutation,
  MeResetPasswordMutation,
} from '@/components/me/me.graphql';
import {
  ProfileFormEdit,
  ProfileFormEditSchema,
} from '@/components/profile/form/edit';
import { ProfileFormResetPassword } from '@/components/profile/form/reset-password';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useContext, useState } from 'react';
import { useMutation } from 'react-relay';

export const Profile: React.FC = () => {
  const t = useTranslations();
  const { me } = useContext(PortalContext);
  const [commitResetPasswordMutation] = useMutation(MeResetPasswordMutation);
  const [commitEditMeUserMutation] = useMutation(MeEditUserMutation);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<ProfileFormEditSchema>();

  const handleSubmit = (values: ProfileFormEditSchema) => {
    if (
      values.first_name !== me?.first_name ||
      values.last_name !== me?.last_name
    ) {
      setPendingValues(values);
      setIsDialogOpen(true);
      return;
    }

    editUser(values);
  };

  const confirmEdition = () => {
    setIsDialogOpen(false);
    if (!pendingValues) {
      return;
    }

    editUser(pendingValues);
    setPendingValues({});
  };

  const editUser = (values: ProfileFormEditSchema) => {
    commitEditMeUserMutation({
      variables: values,
      onError(error) {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
      onCompleted() {
        toast({
          title: t('Utils.Success'),
        });
      },
    });
  };

  const handleResetPassword = () => {
    commitResetPasswordMutation({
      variables: {},
      onError(error) {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
      onCompleted() {
        toast({
          title: t('UserForm.ResetPassword.Success'),
        });
      },
    });
  };

  return (
    <>
      <section className="flex flex-col gap-m">
        <ProfileFormEdit onSubmit={handleSubmit} />
        <ProfileFormResetPassword onSubmit={handleResetPassword} />
      </section>
      <AlertDialogComponent
        isOpen={isDialogOpen}
        AlertTitle={t('DialogActions.ContinueTitle')}
        actionButtonText={t('MenuActions.Continue')}
        variantName={'destructive'}
        onOpenChange={setIsDialogOpen}
        onClickContinue={confirmEdition}>
        {t('ProfilePage.InstancesEditionDialog.ConfirmSentence')}
      </AlertDialogComponent>
    </>
  );
};
