'use client';

import { UserMeEditMutation } from '@/components/admin/user/user.graphql';
import { MeUserForm, staticMeFormSchema } from '@/components/me/me-form';
import { Portal, portalContext } from '@/components/me/portal-context';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from 'filigran-ui';
import { useToast } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import { useContext, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { userMeEditMutation } from '../../../__generated__/userMeEditMutation.graphql';

const MeFilling: React.FunctionComponent = ({}) => {
  const [commitUserMutation] =
    useMutation<userMeEditMutation>(UserMeEditMutation);

  const { toast } = useToast();
  const t = useTranslations();

  const { me } = useContext<Portal>(portalContext);
  const isMissingInformation = me && !me.first_name && !me.last_name;
  const [openSheet, setOpenSheet] = useState(isMissingInformation || false);

  const handleSubmit = (values: z.infer<typeof staticMeFormSchema>) => {
    if (me) {
      commitUserMutation({
        variables: { input: { ...values } },
        onCompleted: () => {
          setOpenSheet(false);
          toast({
            title: t('Utils.Success'),
            description: t('UserActions.UserUpdated', { email: me.email }),
          });
        },
        onError: (error) => {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: t(`Error.Server.${error.message}`),
          });
        },
      });
    }
  };

  return (
    <Sheet
      key={'right'}
      open={openSheet}
      onOpenChange={setOpenSheet}>
      <SheetContent side={'right'}>
        <SheetHeader className="bg-page-background">
          <SheetTitle>{t('UserForm.WhoAreYou')}</SheetTitle>
          <SheetDescription>
            {t('UserForm.WhoAreYouDescription')}
          </SheetDescription>
        </SheetHeader>
        <MeUserForm handleSubmit={handleSubmit} />
      </SheetContent>
    </Sheet>
  );
};

// Component export
export default MeFilling;
