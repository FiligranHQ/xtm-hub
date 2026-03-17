'use client';
import { TrialsManageUsersForm } from '@/components/service/trial-instances/manage-users/trials-manage-users-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

interface Props {
  serviceInstanceId: string;
  organizationId?: string;
  trigger?: React.ReactNode;
}

export const TrialsManageUsersDialog: React.FC<Props> = ({
  serviceInstanceId,
  organizationId,
  trigger,
}) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  return (
    <SheetWithPreventingDialog
      title={t('Service.Trials.ManageUsers.Title')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={
        trigger ?? (
          <Button variant="outline-primary">
            {t('Service.Trials.ManageUsers.Title')}
          </Button>
        )
      }>
      {serviceInstanceId && (
        <TrialsManageUsersForm
          key={serviceInstanceId}
          onCancel={() => setOpenSheet(false)}
          onCompleted={() => setOpenSheet(false)}
          organizationId={organizationId}
          serviceInstanceId={serviceInstanceId}
        />
      )}
    </SheetWithPreventingDialog>
  );
};
