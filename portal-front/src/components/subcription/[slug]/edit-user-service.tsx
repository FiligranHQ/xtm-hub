import { UserServiceForm } from '@/components/service/[slug]/userservice-form';
import { IconActionContext } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { subscriptionByIdQuery$data } from '@generated/subscriptionByIdQuery.graphql';
import { userServices_fragment$data } from '@generated/userServices_fragment.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext, useEffect, useState } from 'react';

interface EditUserServiceProps {
  userService: userServices_fragment$data;
  connectionId: string;
  subscription: subscriptionByIdQuery$data;
}

export const EditUserService: FunctionComponent<EditUserServiceProps> = ({
  userService,
  connectionId,
  subscription,
}) => {
  const t = useTranslations();

  const [openSheet, setOpenSheet] = useState<boolean | null>(null);
  const { setMenuOpen } = useContext(IconActionContext);

  useEffect(() => {
    if (!openSheet && openSheet !== null) setMenuOpen(false);
  }, [openSheet]);

  return (
    <SheetWithPreventingDialog
      open={openSheet ?? false}
      setOpen={setOpenSheet}
      trigger={
        <Button
          variant="ghost"
          className="w-full justify-start normal-case"
          aria-label={'edit'}>
          {t('Utils.Update')}
        </Button>
      }
      title={t('InviteUserServiceForm.Title', {
        serviceName: subscription.subscriptionById?.service_instance?.name,
      })}>
      <UserServiceForm
        userService={userService}
        connectionId={connectionId ?? ''}
        subscription={subscription ?? {}}
      />
    </SheetWithPreventingDialog>
  );
};
