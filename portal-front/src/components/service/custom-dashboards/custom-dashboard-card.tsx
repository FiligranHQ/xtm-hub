import GuardCapacityComponent from '@/components/admin-guard';
import CustomDashboardBento from '@/components/service/custom-dashboards/custom-dashboard-bento';
import { CustomDashboardForm } from '@/components/service/custom-dashboards/custom-dashboard-form';
import {
  DocumentDeleteMutation,
  documentItem,
} from '@/components/service/document/document.graphql';
import { IconActions, IconActionsButton } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import { RESTRICTION } from '@/utils/constant';
import { customDashboardCard_update_childs$key } from '@generated/customDashboardCard_update_childs.graphql';
import { documentDeleteMutation } from '@generated/documentDeleteMutation.graphql';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { Badge, Carousel } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { graphql, readInlineData, useMutation } from 'react-relay';

interface CustomDashboardCardProps {
  data: documentItem_fragment$key;
  connectionId: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const CustomDashboardCard = ({
  data,
  connectionId,
  serviceInstance,
}: CustomDashboardCardProps) => {
  const customDashboard = readInlineData<documentItem_fragment$key>(
    documentItem,
    data
  );
  const t = useTranslations();
  const fileNames = (customDashboard.children_documents ?? [])?.map(
    ({ id }) => id
  );

  const [deleteDocument] = useMutation<documentDeleteMutation>(
    DocumentDeleteMutation
  );
  const [openSheet, setOpenSheet] = useState(false);

  return (
    <>
      <li className="border-light flex flex-col relative rounded border bg-page-background gap-l aria-disabled:opacity-60">
        <Carousel
          placeholder={
            <CustomDashboardBento
              customDashboard={customDashboard}
              serviceInstance={serviceInstance}
            />
          }
          slides={
            fileNames.length > 0
              ? fileNames.map(
                  (fn) => `/document/visualize/${customDashboard.id}/${fn}`
                )
              : undefined
          }
        />
        <div className="flex items-center px-l justify-between">
          <div className="flex gap-s ">
            <h3>{customDashboard.name}</h3>
            <Badge variant={customDashboard.active ? 'secondary' : 'warning'}>
              {customDashboard.active ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <GuardCapacityComponent
            capacityRestriction={[RESTRICTION.CAPABILITY_BYPASS]}>
            <IconActions
              icon={
                <>
                  <MoreVertIcon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{t('Utils.OpenMenu')}</span>
                </>
              }>
              <IconActionsButton
                className="normal-case"
                onClick={() => setOpenSheet(true)}
                aria-label={t('MenuActions.Update')}>
                {t('MenuActions.Update')}
              </IconActionsButton>
              <IconActionsButton
                className="normal-case"
                onClick={() =>
                  deleteDocument({
                    variables: {
                      documentId: customDashboard.id,
                      serviceInstanceId: serviceInstance.id,
                      connections: [connectionId],
                      forceDelete: true,
                    },
                  })
                }
                aria-label={t('MenuActions.Delete')}>
                {t('MenuActions.Delete')}
              </IconActionsButton>
            </IconActions>
          </GuardCapacityComponent>
        </div>
        <p className="flex-1 txt-sub-content px-l pb-l">
          {customDashboard.description}
        </p>
      </li>
      <SheetWithPreventingDialog
        open={openSheet}
        setOpen={setOpenSheet}
        title={t('Service.CustomDashboards.UpdateDashboard')}>
        <CustomDashboardForm
          customDashboard={customDashboard}
          handleSubmit={() => {}}
          onDelete={(id) =>
            deleteDocument({
              variables: {
                documentId: id ?? customDashboard.id,
                serviceInstanceId: serviceInstance.id,
                connections: id ? [] : [connectionId],
                forceDelete: true,
              },
              updater: (store) => {
                if (id) {
                  const { updatableData } =
                    store.readUpdatableFragment<customDashboardCard_update_childs$key>(
                      graphql`
                        fragment customDashboardCard_update_childs on Document
                        @updatable {
                          children_documents {
                            __id
                            id
                          }
                        }
                      `,
                      data as unknown as customDashboardCard_update_childs$key
                    );
                  updatableData.children_documents =
                    updatableData.children_documents!.filter(
                      (c) => c.id !== id
                    ) as [];
                }
              },
            })
          }
        />
      </SheetWithPreventingDialog>
    </>
  );
};

export default CustomDashboardCard;
