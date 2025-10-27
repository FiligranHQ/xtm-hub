'use client';

import { ArrowRightAltIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import GuardCapacityComponent from '@/components/admin-guard';
import { CreateDeploymentRequestMutation } from '@/components/service/trial-instances/create-deployment.graphql';
import {
  TryOpenCTIForm,
  tryOpenCTIFormSchema,
} from '@/components/service/trial-instances/try-opencti-form';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { createDeploymentRequestMutation } from '@generated/createDeploymentRequestMutation.graphql';
import { DeploymentTypeEnum } from '@generated/models/DeploymentType.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { toast } from 'filigran-ui/clients';
import { useMutation } from 'react-relay';
import { z } from 'zod';

// Component
export const StartTrialButton = ({}) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const [commitCreateDeploymentRequestMutationMutation] =
    useMutation<createDeploymentRequestMutation>(
      CreateDeploymentRequestMutation
    );
  const handleSubmit = (values: z.infer<typeof tryOpenCTIFormSchema>) => {
    setOpenSheet(false);
    const { acceptTerms: _, ...valuesWithoutAcceptTerms } = values;
    commitCreateDeploymentRequestMutationMutation({
      variables: {
        input: {
          ...valuesWithoutAcceptTerms,
          platform_identifier: PlatformIdentifierEnum.OPENCTI,
          type: DeploymentTypeEnum.TRIAL,
        },
      },
      // updater: (store) => {
      //   const newDeploymentRequest = store.getRootField(
      //     'createDeploymentRequest'
      //   );
      //   console.log('newDeploymentRequest', newDeploymentRequest);
      //   const root = store.getRoot();
      //   console.log('root', root);
      //   const registeredPlatforms = root.getLinkedRecords(
      //     'registeredPlatforms',
      //     { input: { identifier: PlatformIdentifierEnum.OPENCTI } } // Les mêmes variables que votre query
      //   );
      //   console.log('registeredPlatforms', registeredPlatforms);
      //
      //   // Ajouter le nouveau à la liste
      //   if (registeredPlatforms) {
      //     root.setLinkedRecords(
      //       [...registeredPlatforms, newDeploymentRequest],
      //       'registeredPlatforms',
      //       { input: { identifier: PlatformIdentifierEnum.OPENCTI } }
      //     );
      //   }
      // },
      updater: (store) => {
        const root = store.getRoot();
        root.invalidateRecord();
        // const registeredPlatforms = root.getLinkedRecords(
        //   'registeredPlatforms'
        // );
        // if (registeredPlatforms) {
        //   registeredPlatforms.forEach((record) => {
        //     if (record) store.delete(record.getDataID());
        //   });
        // }
      },

      onCompleted: () => {
        setOpenSheet(false);

        toast({
          title: t('Utils.Success'),
          description: t('Service.Trials.Form.FormRequested'),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };
  return (
    <SheetWithPreventingDialog
      title={t('Service.Trials.StartTrial')}
      setOpen={setOpenSheet}
      open={openSheet}
      trigger={
        <GuardCapacityComponent
          capacityRestriction={[
            OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
            OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
          ]}>
          <Button
            onClick={() => setOpenSheet(true)}
            className="ml-xl bg-white text-black hover:bg-white">
            {t('Service.Trials.StartTrial')}
            <ArrowRightAltIcon className="ml-s size-4" />
          </Button>
        </GuardCapacityComponent>
      }>
      <TryOpenCTIForm
        handleSubmit={handleSubmit}
        handleCloseSheet={() => setOpenSheet(false)}
      />
    </SheetWithPreventingDialog>
  );
};
