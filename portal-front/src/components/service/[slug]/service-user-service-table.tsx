import { Portal, portalContext } from '@/components/me/portal-context';
import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { UserServiceDeleteMutation } from '@/components/service/user_service.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { IconActions, IconActionsButton } from '@/components/ui/icon-actions';
import { i18nKey } from '@/utils/datatable';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { Badge, Button, DataTable } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import {
  FunctionComponent,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useMutation } from 'react-relay';
import { serviceWithSubscriptions_fragment$data } from '../../../../__generated__/serviceWithSubscriptions_fragment.graphql';
import { userService_fragment$data } from '../../../../__generated__/userService_fragment.graphql';
import { userServiceDeleteMutation } from '../../../../__generated__/userServiceDeleteMutation.graphql';

interface ServiceUserServiceProps {
  subscriptionId?: string;
  data: serviceWithSubscriptions_fragment$data;
  setOpenSheet: (open: boolean) => void;
  setCurrentUser: (user: userService_fragment$data) => void;
  toolbar?: ReactNode;
}

const ServiceUserServiceSlug: FunctionComponent<ServiceUserServiceProps> = ({
  subscriptionId = '',
  data,
  setOpenSheet,
  setCurrentUser,
  toolbar,
}) => {
  const { me } = useContext<Portal>(portalContext);
  const t = useTranslations();
  const [commitUserServiceDeletingMutation] =
    useMutation<userServiceDeleteMutation>(UserServiceDeleteMutation);

  const [pagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 500,
  });

  const subscription = data.subscriptions?.find(
    (subscription) => subscription?.id === subscriptionId
  );

  const deleteCurrentUser = (email: string) => {
    commitUserServiceDeletingMutation({
      variables: {
        input: {
          email,
          subscriptionId,
        },
      },
      onCompleted() {},
    });
  };

  const columns: ColumnDef<userService_fragment$data>[] = useMemo(
    () => [
      {
        accessorKey: 'user.first_name',
        id: 'first_name',
        header: t('Service.Management.FirstName'),
      },
      {
        accessorKey: 'user.last_name',
        id: 'last_name',
        header: t('Service.Management.LastName'),
      },
      {
        accessorKey: 'user.email',
        id: 'email',
        header: t('Service.Management.Email'),
      },
      {
        accessorKey: 'name',
        id: 'name',
        header: t('Service.Capabilities.CapabilitiesTitle'),
        size: -1,
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="truncate">
              {row.original?.user_service_capability?.map(
                (user_service_capa) => (
                  <Badge
                    key={user_service_capa?.generic_service_capability?.id}
                    className="mb-2 mr-2 mt-2">
                    {user_service_capa?.generic_service_capability?.name}
                  </Badge>
                )
              )}
            </div>
          );
        },
      },
      {
        id: 'actions',
        size: 40,
        cell: ({ row }) => {
          // The user should not be able to modify himself
          if (row.original.user?.id === me?.id) {
            return null;
          }
          return (
            <div className="flex items-center justify-end">
              {row.original.user_service_capability?.some(
                (user_serv_capa) =>
                  user_serv_capa?.generic_service_capability?.name !==
                  GenericCapabilityName.ManageAccess
              ) && (
                <IconActions
                  icon={
                    <>
                      <MoreVertIcon className="h-4 w-4 text-primary" />
                      <span className="sr-only">{t('Utils.OpenMenu')}</span>
                    </>
                  }>
                  <IconActionsButton
                    aria-label="Edit user rights"
                    onClick={() => {
                      setCurrentUser(row.original);
                      setOpenSheet(true);
                    }}>
                    {t('Utils.Update')}
                  </IconActionsButton>
                  <AlertDialogComponent
                    AlertTitle={t('Service.Management.RemoveAccess')}
                    actionButtonText={t('Service.Management.RemoveAccess')}
                    variantName={'destructive'}
                    triggerElement={
                      <Button
                        variant="ghost"
                        className="w-full justify-start normal-case"
                        aria-label={t('Service.Management.RemoveAccess')}>
                        {t('Utils.Delete')}
                      </Button>
                    }
                    onClickContinue={() =>
                      deleteCurrentUser(row.original.user?.email ?? '')
                    }>
                    {t('Service.Management.AreYouSureRemoveAccess', {
                      firstname: row.original.user?.first_name,
                      lastname: row.original.user?.last_name,
                    })}
                  </AlertDialogComponent>
                </IconActions>
              )}
            </div>
          );
        },
      },
    ],
    [deleteCurrentUser, setCurrentUser, setOpenSheet]
  );

  return (
    <DataTable
      i18nKey={i18nKey(t)}
      columns={columns}
      data={(subscription?.user_service as userService_fragment$data[]) ?? {}}
      toolbar={toolbar}
      tableState={{
        pagination,
        columnPinning: { right: ['actions'] },
        columnVisibility: { first_name: false, last_name: false },
      }}
    />
  );
};
export default ServiceUserServiceSlug;
