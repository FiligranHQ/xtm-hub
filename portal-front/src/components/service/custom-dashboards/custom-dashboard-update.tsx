import {
  CustomDashboardUpdateForm,
  updateCustomDashboardSchema,
} from '@/components/service/custom-dashboards/custom-dashboard-update-form';
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
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import { PUBLIC_DASHBOARD_URL } from '@/utils/path/constant';
import { documentDeleteMutation } from '@generated/documentDeleteMutation.graphql';
import { documentDetailDeleteMutation } from '@generated/documentDetailDeleteMutation.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { documentUpdateMutation } from '@generated/documentUpdateMutation.graphql';
import { Button, toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useContext, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';

// Component interface
interface DashboardUpdateProps {
  customDashboard: documentItem_fragment$data;
  serviceInstanceId: string;
  connectionId: string;
  variant?: 'menu' | 'button';
  userCanUpdate: boolean;
  userCanDelete: boolean;
}

// Component
const DashboardUpdate: React.FunctionComponent<DashboardUpdateProps> = ({
  customDashboard,
  serviceInstanceId,
  connectionId,
  variant = 'button',
  userCanUpdate,
  userCanDelete,
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

  const updateDocument = (
    values: z.infer<typeof updateCustomDashboardSchema>
  ) => {
    setMenuOpen(false);
    updateDocumentMutation({
      variables: {
        documentId: customDashboard.id,
        serviceInstanceId: serviceInstanceId,
        input: {
          short_description: values.shortDescription,
          product_version: values.productVersion,
          description: values.description,
          name: values.name,
          labels: values.labels,
          active: values.active,
          slug: values.slug,
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
          serviceInstanceId: serviceInstanceId,
          connections: [connectionId],
          forceDelete: true,
        },
        onCompleted() {
          router.push(`/service/custom_dashboards/${serviceInstanceId}`);
        },
      });
      revalidatePathActions([`${PUBLIC_DASHBOARD_URL}`]);
    } else {
      // In case we are delete image or we are deleting document from the detail page
      deleteDetailDocumentationMutation({
        variables: {
          documentId: id ?? customDashboard.id,
          serviceInstanceId: serviceInstanceId,
          forceDelete: true,
        },
        onCompleted() {
          if (!id) {
            router.push(`/service/custom_dashboards/${serviceInstanceId}`);
          }
        },
      });
    }
    revalidatePathActions([`${PUBLIC_DASHBOARD_URL}/${customDashboard.slug}`]);
  };

  return (
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
          serviceInstanceId={serviceInstanceId}
          handleSubmit={updateDocument}
          onDelete={deleteDocument}
          userCanDelete={userCanDelete}
          userCanUpdate={userCanUpdate}
        />
      </SheetWithPreventingDialog>
    </div>
  );
};
export default DashboardUpdate;
