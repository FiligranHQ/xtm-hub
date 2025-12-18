'use client';
import GuardCapacityComponent from '@/components/admin-guard';
import { ServiceGroupsByServiceInstanceId } from '@/components/service/service-group.graphql';
import { TrialsManageUsersForm } from '@/components/service/trial-instances/manage-users/trials-manage-users-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { Button } from '@filigran/ui';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { serviceGroupsByServiceInstanceIdQuery } from '@generated/serviceGroupsByServiceInstanceIdQuery.graphql';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryLoader } from 'react-relay';

interface Props {
  platform: registeredPlatformByServiceInstanceId_fragment$data;
}

export const TrialsManageUsersDialog: React.FC<Props> = ({ platform }) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const [queryRef, loadQuery] =
    useQueryLoader<serviceGroupsByServiceInstanceIdQuery>(
      ServiceGroupsByServiceInstanceId
    );

  const loadServiceGroups = useCallback(() => {
    if (!platform?.subscription?.service_instance?.id || !loadQuery) {
      return;
    }

    loadQuery(
      {
        serviceInstanceId: platform?.subscription?.service_instance?.id,
      },
      { fetchPolicy: 'network-only' }
    );
  }, [loadQuery, platform?.subscription?.service_instance?.id]);

  const onCompleted = () => {
    setOpenSheet(false);
    loadServiceGroups();
  };

  useEffect(() => {
    loadServiceGroups();
  }, [loadServiceGroups]);

  return (
    <GuardCapacityComponent
      capacityRestriction={[
        OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
        OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
      ]}>
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
            onCompleted={onCompleted}
            platform={platform}
            queryRef={queryRef}
          />
        )}
      </SheetWithPreventingDialog>
    </GuardCapacityComponent>
  );
};
