'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  ObasScenarioForm,
  ObasScenarioFormValues,
} from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-form';
import { Button } from 'filigran-ui';

import { ObasScenarioCreateMutation } from '@/components/service/obas-scenarios/obas-scenario.graphql';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { obasScenarioCreateMutation } from '@generated/obasScenarioCreateMutation.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';

interface ObasScenarioAddSheetProps {
  connectionId: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

export const ObasScenarioAddSheet = ({
  serviceInstance,
  connectionId,
}: ObasScenarioAddSheetProps) => {
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);
  const [createObasScenario] = useMutation<obasScenarioCreateMutation>(
    ObasScenarioCreateMutation
  );

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const handleSubmit = async (values: ObasScenarioFormValues) => {
    const input = {
      ...omit(values, ['document', 'illustration']),
      uploader_id: values?.uploader_id ?? '',
    };
    const documents = [
      ...Array.from(values.document),
      ...Array.from(values.illustration),
    ];

    createObasScenario({
      variables: {
        input: {
          ...input,
          active: input.active ?? false,
        },
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId],
        document: documents,
      },
      uploadables: fileListToUploadableMap(documents),

      onCompleted: (response) => {
        if (!response.createObasScenario) {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: t('Error.AnErrorOccured'),
          });
          return;
        }

        setOpenSheet(false);

        toast({
          title: t('Utils.Success'),
          description: t('Service.ObasScenario.Actions.Added', {
            name: input.name,
          }),
        });
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${(error as Error).message}`),
        });
      },
    });
  };

  return (
    <>
      {userCanUpdate && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={<Button>{t('Service.ObasScenario.AddObasScenario')}</Button>}
          title={t('Service.ObasScenario.AddObasScenario')}>
          <ObasScenarioForm handleSubmit={handleSubmit} />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
