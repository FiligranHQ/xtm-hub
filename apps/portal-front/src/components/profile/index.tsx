'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import {
  MeEditUserEmailMutation,
  MeEditUserMutation,
  MeResetPasswordMutation,
} from '@/components/me/me.graphql';
import {
  ProfileFormEdit,
  ProfileFormEditSchema,
} from '@/components/profile/form/edit';
import {
  ProfileFormEditEmail,
  ProfileFormEditEmailSchema,
} from '@/components/profile/form/edit-email';
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
  const [commitEditMeUserEmailMutation] = useMutation(MeEditUserEmailMutation);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [translationKey, setTranslationKey] = useState('ConfirmSentence');
  const [translationKeyAlertDialog, setTranslationKeyAlertDialog] = useState(
    'DialogActions.ContinueTitle'
  );
  const [pendingValues, setPendingValues] = useState<ProfileFormEditSchema>();
  const [pendingValuesEmail, setPendingValuesEmail] =
    useState<ProfileFormEditEmailSchema>();

  const handleSubmit = (values: ProfileFormEditSchema) => {
    if (
      values.first_name !== me?.first_name ||
      values.last_name !== me?.last_name
    ) {
      setPendingValues(values);
      setTranslationKey('ConfirmSentence');
      setTranslationKeyAlertDialog('DialogActions.ContinueTitle');
      setIsDialogOpen(true);
      return;
    }

    editUser(values);
  };

  const setSentenceEmail = (values: ProfileFormEditEmailSchema) => {
    if (values?.email?.split('@')[1] !== me?.email.split('@')[1]) {
      setTranslationKey('ConfirmSentenceEmail');
      return;
    }
    setTranslationKey('ConfirmSentenceEmailWithoutDomain');
  };

  const handleSubmitEmail = (values: ProfileFormEditEmailSchema) => {
    setSentenceEmail(values);

    setTranslationKeyAlertDialog(
      'ProfilePage.PlatformsEditionDialog.ConfirmTitleEmail'
    );
    setPendingValuesEmail(values);
    setIsDialogOpen(true);
  };

  const confirmEdition = () => {
    setIsDialogOpen(false);

    if (pendingValuesEmail) {
      editUserEmail(pendingValuesEmail);
      setPendingValuesEmail({});
    }
    if (pendingValues) {
      editUser(pendingValues);
      setPendingValues({});
    }
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

  const editUserEmail = (values: ProfileFormEditEmailSchema) => {
    commitEditMeUserEmailMutation({
      variables: { newEmail: values.email },

      updater: (store) => {
        const meRecord = store.getRoot().getLinkedRecord('me');
        if (meRecord) {
          const personalSpace = me?.organizations.find(
            (org) => org.name === me.email
          );
          if (personalSpace) {
            meRecord.setValue(personalSpace.id, 'selected_organization_id');
          }
        }
      },
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
          title: t('Utils.Success'),
          description: t('UserForm.ResetPassword.Success'),
        });
      },
    });
  };

  return (
    <>
      <section className="flex flex-col gap-xl w-8/12 m-auto">
        <ProfileFormEdit onSubmit={handleSubmit} />
        <ProfileFormEditEmail onSubmit={handleSubmitEmail} />
        <ProfileFormResetPassword onSubmit={handleResetPassword} />
      </section>
      <AlertDialogComponent
        isOpen={isDialogOpen}
        AlertTitle={t(`${translationKeyAlertDialog}`)}
        actionButtonText={t('MenuActions.Continue')}
        onOpenChange={setIsDialogOpen}
        onClickContinue={confirmEdition}>
        {t(`ProfilePage.PlatformsEditionDialog.${translationKey}`)}
      </AlertDialogComponent>
    </>
  );
};
