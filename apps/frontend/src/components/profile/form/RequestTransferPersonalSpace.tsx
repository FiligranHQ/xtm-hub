'use client';
import { MeRequestTransferPersonalSpaceMutation } from '@/components/me/me.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import {
  AutoForm,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  toast,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';

import { useTranslate } from '@tolgee/react';
const formSchema = z.object({
  new_email: z.string().email('This is not a valid email.'),
});
export type RequestTransferPersonalSpaceSchema = z.infer<typeof formSchema>;

export const RequestTransferPersonalSpace = () => {
  const router = useRouter();
  const { t } = useTranslate();
  const [pendingValues, setPendingValues] =
    useState<RequestTransferPersonalSpaceSchema>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [commitTransferPersonalSpaceMutation] = useMutation(
    MeRequestTransferPersonalSpaceMutation
  );

  const onSubmit = (values: RequestTransferPersonalSpaceSchema) => {
    setIsDialogOpen(true);
    setPendingValues(values);
  };

  const confirmEdition = () => {
    setIsDialogOpen(false);
    commitTransferPersonalSpaceMutation({
      variables: {
        new_email: pendingValues?.new_email,
      },
      onError(error) {
        toast({
          variant: 'destructive',
          title: t('Utils_Error'),
          description: t(`Error_Server_${error.message}`),
        });
      },
      onCompleted() {
        toast({
          title: t('Utils_Success'),
          description: t('ProfilePage_PersonalSpace_SuccessRequest'),
        });
        router.push('/app');
      },
    });
  };
  return (
    <>
      <Separator className="my-s" />
      <h2 className="text-destructive">{t('Utils_DangerZone')}</h2>
      <Card className="border-2 border-red">
        <CardHeader>
          <CardTitle className="heading-lg">
            {t('ProfilePage_PersonalSpace_TitleDangerZone')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {t('ProfilePage_PersonalSpace_TransferPersoSpaceExplanation')}
          <AutoForm
            className="mt-xl"
            onSubmit={(values) => onSubmit(values)}
            formSchema={formSchema}
            fieldConfig={{
              new_email: {
                label: t('UserListPage_UserForm_Email'),
                inputProps: {
                  placeholder: t('ProfilePage_PersonalSpace_EmailPlaceholder'),
                },
              },
            }}>
            <div className="mt-xl flex justify-end">
              <Button
                variant={'destructive'}
                aria-label={t('ProfilePage_PersonalSpace_TransferPersoSpace')}>
                {t('ProfilePage_PersonalSpace_Transfer')}
              </Button>
            </div>
          </AutoForm>
        </CardContent>
      </Card>
      <AlertDialogComponent
        isOpen={isDialogOpen}
        AlertTitle={t('DialogActions_ContinueTitle')}
        actionButtonText={t('MenuActions_Continue')}
        variantName={'destructive'}
        onOpenChange={setIsDialogOpen}
        onClickContinue={confirmEdition}>
        {t('ProfilePage_PersonalSpace_TransferConfirmSentence')}
      </AlertDialogComponent>
    </>
  );
};
