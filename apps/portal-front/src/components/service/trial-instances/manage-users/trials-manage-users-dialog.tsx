'use client';
import { ServiceGroupsByServiceInstanceId } from '@/components/service/service-group.graphql';
import { TrialsManageUsersForm } from '@/components/service/trial-instances/manage-users/trials-manage-users-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useMountingLoader from '@/hooks/useMountingLoader';
import { Button } from '@filigran/ui';
import { serviceGroupsByServiceInstanceIdQuery } from '@generated/serviceGroupsByServiceInstanceIdQuery.graphql';
import { useTranslations } from 'next-intl';
import React, { useCallback, useState } from 'react';
import { useQueryLoader } from 'react-relay';

interface Props {
  serviceInstanceId?: string;
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

  const [queryRef, loadQuery] =
    useQueryLoader<serviceGroupsByServiceInstanceIdQuery>(
      ServiceGroupsByServiceInstanceId
    );

  useMountingLoader(loadQuery, {
    serviceInstanceId: serviceInstanceId,
  });

  const loadServiceGroups = useCallback(() => {
    if (!serviceInstanceId || !loadQuery) {
      return;
    }
    loadQuery(
      {
        serviceInstanceId,
      },
      { fetchPolicy: 'store-and-network' }
    );
  }, [loadQuery, serviceInstanceId]);

  const onCompleted = () => {
    setOpenSheet(false);
    loadServiceGroups();
  };

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
      {queryRef && (
        <TrialsManageUsersForm
          onCancel={() => setOpenSheet(false)}
          onCompleted={onCompleted}
          organizationId={organizationId}
          queryRef={queryRef}
        />
      )}
    </SheetWithPreventingDialog>
  );
};
