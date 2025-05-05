'use client';

import {
  MeEditUserMutation,
  MeResetPasswordMutation,
} from '@/components/me/me.graphql';
import {
  ProfileFormEdit,
  ProfileFormEditSchema,
} from '@/components/profile/form/edit';
import { ProfileFormResetPassword } from '@/components/profile/form/reset-password';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useMutation } from 'react-relay';

export const Profile: React.FC = () => {
  const t = useTranslations();
  const [commitResetPasswordMutation] = useMutation(MeResetPasswordMutation);
  const [commitEditMeUserMutation] = useMutation(MeEditUserMutation);

  const handleSubmit = (values: ProfileFormEditSchema) => {
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
          title: t('Utils.Success'),
        });
      },
    });
  };

  return (
    <>
      <ProfileFormEdit onSubmit={handleSubmit} />
      <ProfileFormResetPassword onSubmit={handleResetPassword} />
    </>
  );
};
