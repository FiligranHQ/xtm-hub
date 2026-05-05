import { UserServiceForm } from '@/components/service/[slug]/UserServiceForm';
import { IconActionContext } from '@/components/ui/IconActions';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { subscriptionByIdQuery$data } from '@generated/subscriptionByIdQuery.graphql';
import { userServices_fragment$data } from '@generated/userServices_fragment.graphql';

import { useTranslations } from 'next-intl';
import { useContext, useEffect } from 'react';

interface EditUserServiceProps {
  userService: userServices_fragment$data;
  connectionId: string;
  subscription: subscriptionByIdQuery$data;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const EditUserService = ({
  userService,
  connectionId,
  subscription,
  open,
  setOpen,
}: EditUserServiceProps) => {
  const t = useTranslations();

  const { setMenuOpen } = useContext(IconActionContext);

  useEffect(() => {
    if (!open) setMenuOpen(false);
  }, [open, setMenuOpen]);

  return (
    <SheetWithPreventingDialog
      open={open}
      setOpen={setOpen}
      title={t('InviteUserServiceForm.Title', {
        serviceName: subscription.subscriptionById!.service_instance!.name,
      })}>
      <UserServiceForm
        userService={userService}
        connectionId={connectionId ?? ''}
        subscription={subscription ?? {}}
      />
    </SheetWithPreventingDialog>
  );
};
