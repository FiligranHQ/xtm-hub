import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import {
  CustomDashboardUpdateForm,
  updateCustomDashboardSchema,
} from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-update-form';
import {
  DocumentDeleteMutation,
  DocumentDetailDeleteMutation,
  DocumentUpdateMutation,
} from '@/components/service/document/document.graphql';
import {
  IconActionContext,
  IconActionsButton,
} from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import { PUBLIC_DASHBOARD_URL } from '@/utils/path/constant';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { documentDeleteMutation } from '@generated/documentDeleteMutation.graphql';
import { documentDetailDeleteMutation } from '@generated/documentDetailDeleteMutation.graphql';
import { documentUpdateMutation } from '@generated/documentUpdateMutation.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button, toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useContext, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';

// Component interface
interface DashboardUpdateProps {
  customDashboard: customDashboardsItem_fragment$data;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
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
  const { setMenuOpen } = useContext(IconActionContext);

  const [deleteDetailDocumentationMutation] =
    useMutation<documentDetailDeleteMutation>(DocumentDetailDeleteMutation);

  const [deleteDocumentMutation] = useMutation<documentDeleteMutation>(
    DocumentDeleteMutation
  );

  const [updateDocumentMutation] = useMutation<documentUpdateMutation>(
    DocumentUpdateMutation
  );

  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const updateDocument = (
    values: z.infer<typeof updateCustomDashboardSchema>
  ) => {
    setMenuOpen(false);
    updateDocumentMutation({
      variables: {
        documentId: customDashboard.id,
        serviceInstanceId: serviceInstance.id,
        input: {
          short_description: values.shortDescription,
          product_version: values.productVersion,
          description: values.description,
          name: values.name,
          labels: values.labels,
          active: values.active,
          slug: values.slug,
          uploader_organization_id: values.uploader_organization_id,
        },
      },
      onCompleted: (response) => {
        // If the service has changed, we need to revalidate the path
        // If the slug has changed, it's necessary to revalidate the previous path, as the new one may not yet be cached.
        revalidatePathActions([
          `${PUBLIC_DASHBOARD_URL}/${customDashboard.slug}`,
          `${PUBLIC_DASHBOARD_URL}`,
        ]);
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('VaultActions.DocumentUpdated', {
            file_name: response.editDocument.name,
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

  const deleteDocument = (id?: string) => {
    if (!id && connectionId) {
      // In case we are in the list and we want to delete a dashboard
      setMenuOpen(false);
      deleteDocumentMutation({
        variables: {
          documentId: customDashboard.id,
          serviceInstanceId: serviceInstance.id,
          connections: [connectionId],
          forceDelete: true,
        },
        onCompleted() {
          router.push(`/service/custom_dashboards/${serviceInstance.id}`);
        },
      });
      revalidatePathActions([`${PUBLIC_DASHBOARD_URL}`]);
    } else {
      // In case we are delete image or we are deleting document from the detail page
      deleteDetailDocumentationMutation({
        variables: {
          documentId: id ?? customDashboard.id,
          serviceInstanceId: serviceInstance.id,
          forceDelete: true,
        },
        onCompleted() {
          if (!id) {
            router.push(`/service/custom_dashboards/${serviceInstance.id}`);
          }
        },
      });
    }
    revalidatePathActions([`${PUBLIC_DASHBOARD_URL}/${customDashboard.slug}`]);
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
            serviceInstanceId={serviceInstance.id}
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
