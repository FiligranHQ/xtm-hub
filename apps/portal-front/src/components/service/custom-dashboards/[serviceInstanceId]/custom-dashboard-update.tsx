import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  CustomDashboardUpdateForm,
  updateCustomDashboardSchema,
} from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-update-form';
import { IconActionsButton } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import { omit } from '@/lib/omit';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import { FormImagesValues, splitExistingAndNewImages } from '@/utils/documents';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { customDashboardDeleteMutation } from '@generated/customDashboardDeleteMutation.graphql';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { customDashboardsUpdateMutation } from '@generated/customDashboardsUpdateMutation.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { Button, toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import {
  CustomDashboardDeleteMutation,
  CustomDashboardsUpdateMutation,
} from '../custom-dashboard.graphql';

// Component interface
interface DashboardUpdateProps {
  customDashboard: customDashboardsItem_fragment$data;
  serviceInstance: serviceInstance_fragment$data;
  connectionId?: string;
  variant?: 'menu' | 'button';
}

// Component
const DashboardUpdate: React.FunctionComponent<DashboardUpdateProps> = ({
  customDashboard,
  serviceInstance,
  connectionId,
  variant = 'button',
}) => {
  const t = useTranslations();
  const router = useRouter();

  const [openSheet, setOpenSheet] = useState(false);

  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const [deleteCustomDashboardMutation] =
    useMutation<customDashboardDeleteMutation>(CustomDashboardDeleteMutation);

  const [updateCustomDashboardMutation] =
    useMutation<customDashboardsUpdateMutation>(CustomDashboardsUpdateMutation);

  const updateDocument = (
    values: z.infer<typeof updateCustomDashboardSchema>
  ) => {
    const input = {
      ...omit(values, ['document', 'images']),
      uploader_id: values?.uploader_id ?? '',
    };
    // Split images between existing and new ones
    const images = Array.from(values.images ?? []) as FormImagesValues;
    const [existingImages, newImages] = splitExistingAndNewImages(images);
    const documentsToUpload = [
      ...Array.from(values.document ?? []), // We need null to keep the first place in the uploadables array for the document
      ...newImages,
    ];

    updateCustomDashboardMutation({
      variables: {
        input,
        serviceInstanceId: serviceInstance.id,
        document: documentsToUpload,
        documentId: customDashboard.id,
        updateDocument: values.document !== undefined,
        images: existingImages,
      },
      uploadables: fileListToUploadableMap(documentsToUpload),
      onCompleted: () => {
        // If the service has changed, we need to revalidate the path
        // If the slug has changed, it's necessary to revalidate the previous path, as the new one may not yet be cached.
        revalidatePathActions([
          `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${customDashboard.slug}`,
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

  const deleteDocument = () => {
    deleteCustomDashboardMutation({
      variables: {
        documentId: customDashboard.id,
        serviceInstanceId: serviceInstance.id,
        connections: [connectionId ?? ''],
      },
      onCompleted() {
        revalidatePathActions([
          `${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${customDashboard.slug}`,
          `${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}`,
        ]);
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('Service.CustomDashboards.Actions.Deleted', {
            name: customDashboard.name,
          }),
        });
        router.push(
          `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`
        );
      },
    });
  };

  return (
    (userCanDelete || userCanUpdate) && (
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}>
        {variant === 'button' ? (
          <Button
            variant="outline"
            onClick={() => {
              setOpenSheet(true);
            }}>
            {t('MenuActions.Update')}
          </Button>
        ) : (
          <IconActionsButton
            className="normal-case"
            onClick={() => {
              setOpenSheet(true);
            }}
            aria-label={t('MenuActions.Update')}>
            {t('MenuActions.Update')}
          </IconActionsButton>
        )}

        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          title={t('Service.CustomDashboards.UpdateDashboard')}>
          <CustomDashboardUpdateForm
            customDashboard={customDashboard}
            handleSubmit={updateDocument}
            onDelete={deleteDocument}
            userCanDelete={userCanDelete}
            userCanUpdate={userCanUpdate}
          />
        </SheetWithPreventingDialog>
      </div>
    )
  );
};
export default DashboardUpdate;
