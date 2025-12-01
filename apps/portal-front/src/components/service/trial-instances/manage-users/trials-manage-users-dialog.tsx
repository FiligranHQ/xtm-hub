'use client';
import { ServiceGroupsByServiceInstanceId } from '@/components/service/service-group.graphql';
import { TrialsManageUsersForm } from '@/components/service/trial-instances/manage-users/trials-manage-users-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { serviceGroupsByServiceInstanceIdQuery } from '@generated/serviceGroupsByServiceInstanceIdQuery.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { useQueryLoader } from 'react-relay';

interface Props {
  platform: registeredPlatformByServiceInstanceId_fragment$data;
}

export const TrialsManageUsersDialog: React.FC<Props> = ({ platform }) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(true);

  const [queryRef, loadQuery] =
    useQueryLoader<serviceGroupsByServiceInstanceIdQuery>(
      ServiceGroupsByServiceInstanceId
    );

  useEffect(() => {
    if (!platform?.subscription?.service_instance?.id || !loadQuery) {
      return;
    }

    loadQuery({
      serviceInstanceId: platform?.subscription?.service_instance?.id,
    });
  }, [loadQuery, platform?.subscription?.service_instance?.id]);

  return (
    <SheetWithPreventingDialog
      title={t('Service.Trials.ManageUsers.Title')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={
        <Button variant="outline-primary">
          {t('Service.Trials.ManageUsers.Title')}
        </Button>
      }>
      {queryRef && (
        <TrialsManageUsersForm
          onCancel={() => setOpenSheet(false)}
          platform={platform}
          queryRef={queryRef}
        />
      )}
    </SheetWithPreventingDialog>
  );
};
