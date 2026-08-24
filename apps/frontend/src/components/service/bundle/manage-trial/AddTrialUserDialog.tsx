'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@filigran/ui';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { AddTrialUserForm } from './AddTrialUserForm';

interface AddTrialUserDialogProps {
  serviceInstanceId: string;
  products?: PlatformIdentifier[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const AddTrialUserDialog = ({
  serviceInstanceId,
  products,
  open,
  setOpen,
}: AddTrialUserDialogProps) => {
  const t = useTranslations();

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
          onCompleted={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
