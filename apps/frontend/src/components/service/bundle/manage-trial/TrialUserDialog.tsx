'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@filigran/ui';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { AddTrialUserForm } from './AddTrialUserForm';

interface TrialUserDialogProps {
  serviceInstanceId: string;
  products?: PlatformIdentifier[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const TrialUserDialog = ({
  serviceInstanceId,
  products,
  open,
  setOpen,
}: TrialUserDialogProps) => {
  const t = useTranslations();
  const onClose = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t('Service.Bundle.ManageTrial.AddUserDialog.Title')}
          </DialogTitle>
        </DialogHeader>
        <AddTrialUserForm
          serviceInstanceId={serviceInstanceId}
          products={products}
          onCompleted={onClose}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
