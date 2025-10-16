'use client';

import { EditService } from '@/components/service/edit-service';
import {
  IconActions,
  IconActionsItem,
  IconActionsLink,
} from '@/components/ui/icon-actions';
import { SearchInput } from '@/components/ui/search-input';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { i18nKey } from '@/utils/datatable';
import { APP_PATH } from '@/utils/path/constant';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { serviceQuery } from '@generated/serviceQuery.graphql';
import { servicesList_services$key } from '@generated/servicesList_services.graphql';
import { ColumnDef, getSortedRowModel } from '@tanstack/react-table';
import { MoreVertIcon } from 'filigran-icon';
import { Badge, Combobox, DataTable } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { RefetchFnDynamic } from 'react-relay';
import { useDebounceCallback } from 'usehooks-ts';

interface AdminServiceTabProps {
  serviceData: serviceList_fragment$data[];
  refetch: RefetchFnDynamic<serviceQuery, servicesList_services$key>;
}

const AdminServiceTab = ({ serviceData, refetch }: AdminServiceTabProps) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [editedService, setEditedService] =
    useState<serviceList_fragment$data>();
  const [selectedValue, setSelectedValue] = useState<
    | {
        value: string;
        label: string;
      }
    | undefined
  >(undefined);
  const columns: ColumnDef<serviceList_fragment$data>[] = [
    {
      accessorKey: 'name',
      id: 'name',
      header: t('Service.Name'),
    },
    {
      accessorKey: 'description',
      id: 'description',
      header: t('Service.Description'),
    },
    {
      accessorKey: 'creation_status',
      id: 'creation_status',
      header: t('Service.CreationStatus'),
    },
    {
      accessorKey: 'organizations',
      id: 'organizations',
      header: t('Service.Organizations'),
      cell: ({ row }) => {
        return (
          <>
            {row.original.service_definition?.identifier ===
              ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION && (
              <Badge>
                {row.original.subscriptions?.[0]?.organization.name.toUpperCase()}
              </Badge>
            )}

            {row.original.service_definition?.identifier !==
              ServiceDefinitionIdentifierEnum.OPENCTI_REGISTRATION &&
              row.original.service_definition?.identifier !==
                ServiceDefinitionIdentifierEnum.LINK && (
                <>
                  {row.original.subscriptions?.length}{' '}
                  {t('Service.Organizations')}
                </>
              )}
          </>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <>
            <div className="flex items-center justify-end">
              <IconActions
                icon={
                  <>
                    <MoreVertIcon
                      aria-hidden={true}
                      focusable={false}
                      className="h-4 w-4 text-primary"
                    />
                    <span className="sr-only">{t('Utils.OpenMenu')}</span>
                  </>
                }>
                {row.original.service_definition?.identifier !== 'link' && (
                  <IconActionsLink
                    href={`/${APP_PATH}/admin/service/${row.id}`}>
                    {t('Service.GoToAdminLabel')}
                  </IconActionsLink>
                )}
                <IconActionsItem onClick={() => editService(row.original)}>
                  {t('ServiceForm.UpdatePictures')}
                </IconActionsItem>
              </IconActions>
            </div>
          </>
        );
      },
    },
  ];

  const editService = (service: serviceList_fragment$data) => {
    setEditedService(service);
    setOpen(true);
  };

  const getServiceDefinitionData = useMemo(() => {
    return serviceData
      .map((service) => ({
        value: service.service_definition?.identifier ?? '',
        label: service.service_definition?.name ?? '',
      }))
      .filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.value === item.value)
      );
  }, [serviceData]);

  const handleInputChange = (inputValue: string) => {
    refetch({ searchTerm: inputValue });
  };
  const handleIdentifierChange = (
    selectedValue: { value: string; label: string } | undefined
  ) => {
    setSelectedValue(selectedValue);
    if (!selectedValue) {
      refetch({ filters: [] });
      return;
    }
    refetch({
      filters: [
        {
          key: 'serviceDefinition_identifier',
          value: [selectedValue.value],
        },
      ],
    });
  };

  const debounceHandleInput = useDebounceCallback(
    (e) => handleInputChange(e.target.value),
    DEBOUNCE_TIME
  );

  return (
    <>
      <DataTable
        columns={columns}
        i18nKey={i18nKey(t)}
        data={serviceData}
        toolbar={
          <div className="flex flex-col-reverse items-center justify-between gap-s sm:flex-row">
            <SearchInput
              containerClass="w-full sm:w-1/3"
              placeholder={t('Service.SearchServices')}
              onChange={debounceHandleInput}
            />
            <Combobox
              dataTab={getServiceDefinitionData}
              order={'Filter by service'}
              placeholder={'Choose a value'}
              emptyCommand={'Not found'}
              onValueChange={handleIdentifierChange}
              value={selectedValue}
            />
          </div>
        }
        tableOptions={{
          getSortedRowModel: getSortedRowModel(),
        }}
      />

      <EditService
        setOpen={setOpen}
        open={open}
        service={editedService as serviceList_fragment$data}
      />
    </>
  );
};
export default AdminServiceTab;
