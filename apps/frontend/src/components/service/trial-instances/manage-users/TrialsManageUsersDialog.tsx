'use client';
import { TrialsManageUsersForm } from '@/components/service/trial-instances/manage-users/TrialsManageUsersForm';
import { SheetWithPreventingDialog } from '@/components/ui/SheetWithPreventingDialog';
import { Button } from '@filigran/ui';
import React, { useState } from 'react';

import { useTranslate } from '@tolgee/react';
interface TrialsManageUsersDialogProps {
  serviceInstanceId: string;
  organizationId?: string;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

export const TrialsManageUsersDialog = ({
  serviceInstanceId,
  organizationId,
  trigger,
  defaultOpen,
}: TrialsManageUsersDialogProps) => {
  const { t } = useTranslate();
  const [openSheet, setOpenSheet] = useState(defaultOpen ?? false);

  return (
    <SheetWithPreventingDialog
      title={t('Service_Trials_ManageUsers_Title')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={
        trigger ?? (
          <Button variant="secondary">
            {t('Service_Trials_ManageUsers_Title')}
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
