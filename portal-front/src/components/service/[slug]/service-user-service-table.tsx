import { UserServiceDeleteMutation } from '@/components/service/user_service.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { IconActions } from '@/components/ui/icon-actions';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { DataTable } from 'filigran-ui/clients';
import { Badge, Button } from 'filigran-ui/servers';
import { FunctionComponent, ReactNode, useMemo, useState } from 'react';
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
        header: 'First Name',
      },
      {
        accessorKey: 'user.last_name',
        id: 'last_name',
        header: 'Last Name',
      },
      {
        accessorKey: 'user.email',
        id: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'service_capability_names',
        id: 'service_capability_names',
        header: 'Capabilities',
        enableSorting: false,
        cell: ({ row }) => {
          return (
            <div className="truncate">
              {row.original?.service_capability?.map((service_capa) => (
                <Badge
                  key={service_capa?.id}
                  className="mb-2 mr-2 mt-2">
                  {service_capa?.service_capability_name}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          return (
            <>
              {row.original.service_capability?.some(
                (serv_capa) =>
                  serv_capa?.service_capability_name !== 'MANAGE_ACCESS'
              ) && (
                <IconActions
                  icon={
                    <>
                      <MoreVertIcon className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </>
                  }>
                  <Button
                    variant={'ghost'}
                    className="w-full justify-start"
                    aria-label="Edit user rights"
                    onClick={() => {
                      setCurrentUser(row.original);
                      setOpenSheet(true);
                    }}>
                    Edit
                  </Button>
                  <AlertDialogComponent
                    AlertTitle={'Remove access'}
                    actionButtonText={'Remove rights'}
                    variantName={'destructive'}
                    triggerElement={
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        aria-label="Remove access">
                        Delete
                      </Button>
                    }
                    onClickContinue={() =>
                      deleteCurrentUser(row.original.user?.email ?? '')
                    }>
                    Are you sure you want to remove the access for the user
                    {row.original.user?.first_name}{' '}
                    {row.original.user?.last_name} for this service ?
                  </AlertDialogComponent>
                </IconActions>
              )}
            </>
          );
        },
      },
    ],
    [deleteCurrentUser, setCurrentUser, setOpenSheet]
  );

  return (
    <DataTable
      columns={columns}
      data={(subscription?.user_service as userService_fragment$data[]) ?? {}}
      toolbar={toolbar}
      tableState={{ pagination, columnPinning: { right: ['actions'] } }}
    />
  );
};
export default ServiceUserServiceSlug;
