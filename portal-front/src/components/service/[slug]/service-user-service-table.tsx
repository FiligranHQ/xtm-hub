import * as React from 'react';
import { FunctionComponent, useMemo } from 'react';
import { useMutation } from 'react-relay';
import { userService_fragment$data } from '../../../../__generated__/userService_fragment.graphql';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Badge, Button } from 'filigran-ui/servers';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { userServiceDeleteMutation } from '../../../../__generated__/userServiceDeleteMutation.graphql';
import { UserServiceDeleteMutation } from '@/components/service/user_service.graphql';
import { DataTable } from 'filigran-ui/clients';
import {Ellipsis} from "lucide-react";
import {IconActions} from "@/components/ui/icon-actions";

interface ServiceUserServiceProps {
  subscriptionId?: string;
  data?: userService_fragment$data[];
  setOpenSheet: (open: boolean) => void;
  setCurrentUser: (user: userService_fragment$data) => void;
  loadQuery: () => void;
}

const ServiceUserServiceSlug: FunctionComponent<ServiceUserServiceProps> = ({
  subscriptionId = '',
  data = [],
  setOpenSheet,
  setCurrentUser,
  loadQuery,
}) => {
  const [commitUserServiceDeletingMutation] =
    useMutation<userServiceDeleteMutation>(UserServiceDeleteMutation);

  const deleteCurrentUser = (email: string) => {
    commitUserServiceDeletingMutation({
      variables: {
        input: {
          email,
          subscriptionId,
        },
      },
      onCompleted() {
        loadQuery();
      },
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
            <>
              {row.original?.service_capability?.map((service_capa) => (
                <Badge
                  key={service_capa?.id}
                  className="mb-2 mr-2 mt-2">
                  {service_capa?.service_capability_name}
                </Badge>
              ))}
            </>
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
                      serv_capa?.service_capability_name !== 'ADMIN_SUBSCRIPTION'
              ) && (
              <IconActions icon={
                <>
                  <Ellipsis className="h-4 w-4 rotate-90" />
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
                    AlertTitle={"Remove user's rights"}
                    actionButtonText={'Remove rights'}
                    variantName={'destructive'}
                    triggerElement={
                      <Button
                          variant="ghost"
                          className="w-full justify-start"
                          aria-label="Remove User's rights">
                          Delete rights
                      </Button>
                    }
                    onClickContinue={() =>
                        deleteCurrentUser(row.original.user?.email ?? '')
                    }>
                  Are you sure you want to remove the access for the user
                  {row.original.user?.first_name} {row.original.user?.last_name}{' '}
                  for this service ?
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
  const [pagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  return (
    <DataTable
      columns={columns}
      data={data}
      tableState={{ pagination, columnPinning: { right: ['actions']}}}
    />
  );
};
export default ServiceUserServiceSlug;
