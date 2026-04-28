'use client';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { SheetWithPreventingDialog } from '../../../ui/SheetWithPreventingDialog';
import { TrialsManageUsersForm } from './TrialsManageUsersForm';

interface Props {
  serviceInstanceId: string;
  organizationId?: string;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

export const TrialsManageUsersDialog: React.FC<Props> = ({
  serviceInstanceId,
  organizationId,
  trigger,
  defaultOpen,
}) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(defaultOpen ?? false);

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
