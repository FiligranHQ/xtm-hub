'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  ObasScenarioForm,
  ObasScenarioFormValues,
} from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-form';
import {
  ObasScenarioDeleteMutation,
  ObasScenarioUpdateMutation,
} from '@/components/service/obas-scenarios/obas-scenario.graphql';
import { IconActionsButton } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { obasScenarioDeleteMutation } from '@generated/obasScenarioDeleteMutation.graphql';
import { obasScenariosItem_fragment$data } from '@generated/obasScenariosItem_fragment.graphql';
import { obasScenarioUpdateMutation } from '@generated/obasScenarioUpdateMutation.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { Button, toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';

interface ObasScenarioUpdateSheetProps {
  connectionId?: string;
  serviceInstance: serviceInstance_fragment$data;
  obasScenario: obasScenariosItem_fragment$data;
  onDelete?: () => void;
  variant?: 'menu' | 'button';
}

export const ObasScenarioUpdateSheet = ({
  serviceInstance,
  connectionId,
  obasScenario,
  onDelete,
  variant = 'button',
}: ObasScenarioUpdateSheetProps) => {
  const t = useTranslations();

  const [openSheet, setOpenSheet] = useState<boolean>(false);

  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const [deleteObasScenarioMutation] = useMutation<obasScenarioDeleteMutation>(
    ObasScenarioDeleteMutation
  );

  const deleteDocument = async () => {
    deleteObasScenarioMutation({
      variables: {
        documentId: obasScenario.id,
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId ?? ''],
      },
      onCompleted() {
        onDelete?.();
      },
    });
    await revalidatePathActions([
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    ]);
  };

  const [updateObasScenarioMutation] = useMutation<obasScenarioUpdateMutation>(
    ObasScenarioUpdateMutation
  );

  const handleSubmit = (values: ObasScenarioFormValues) => {
    const input = {
      ...omit(values, ['document', 'illustration']),
      uploader_id: values?.uploader_id ?? '',
    };

    // Split images between existing and new ones
    const images = Array.from(values.illustration ?? []) as FormImagesValues;
    const [existingImages, newImages] = splitExistingAndNewImages(images);
    const documentsToUpload = [
      ...Array.from(values.document ?? []), // We need null to keep the first place in the uploadables array for the document
      ...newImages,
    ];
    updateObasScenarioMutation({
      variables: {
        input,
        serviceInstanceId: serviceInstance.id,
        document: documentsToUpload,
        documentId: obasScenario.id,
        updateDocument: values.document !== undefined,
        images: existingImages,
      },
      uploadables: fileListToUploadableMap(documentsToUpload),
      onCompleted: () => {
        // If the service has changed, we need to revalidate the path
        // If the slug has changed, it's necessary to revalidate the previous path, as the new one may not yet be cached.
        revalidatePathActions([
          `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${obasScenario.slug}`,
          `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
        ]);
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentUpdated', {
            file_name: values.name,
          }),
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
    <>
      {(userCanUpdate || userCanDelete) && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={
            variant === 'button' ? (
              <Button variant="outline">{t('Utils.Update')}</Button>
            ) : (
              <IconActionsButton
                className="normal-case"
                onClick={() => {
                  setOpenSheet(true);
                }}
                aria-label={t('MenuActions.Update')}>
                {t('MenuActions.Update')}
              </IconActionsButton>
            )
          }
          title={t('Service.ObasScenario.UpdateObasScenario', {
            name: obasScenario.name,
          })}>
          <ObasScenarioForm
            onDelete={deleteDocument}
            userCanDelete={userCanDelete}
            obasScenario={obasScenario}
            handleSubmit={handleSubmit}
          />
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
