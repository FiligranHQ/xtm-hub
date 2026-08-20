'use client';

import {
  DocumentNameCell,
  DocumentShortDescriptionCell,
} from '@/components/service/components/DocumentListCells';
import { buildMetadataColumns } from '@/components/service/components/DocumentListColumns';
import {
  ServiceListDisplayMode,
  ServiceListDisplayModeEnum,
} from '@/components/service/components/header/ServiceListHeader';
import ServiceCard from '@/components/service/components/ServiceCard';
import { useServiceContext } from '@/components/service/components/ServiceContext';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { IntegrationType, ServiceRestriction } from '@graphql/generated';
import { useContext, useMemo, useState } from 'react';

import {
  CardTypeEnum,
  ServiceDelete,
} from '@/components/service/components/ServiceDelete';
import { ServiceManageSheet } from '@/components/service/components/ServiceManageSheet';
import { useDocumentContext } from '@/components/service/document/use-document-context';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/BadgeOverflowCounter';
import { IconActions, IconActionsItem } from '@/components/ui/IconActions';
import { ShareLinkButton } from '@/components/ui/share-link/ShareLinkButton';
import useServiceCapability from '@/hooks/use-service-capability';
import revalidatePathActions from '@/utils/actions/revalidate-path.actions';
import {
  isIntegrationItem,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { MoreVertIcon } from '@filigran/icon';
import { DataTable, toast } from '@filigran/ui';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface DocumentListProps {
  documents: documentItem_fragment$data[];
  displayMode: ServiceListDisplayMode;
  connectionId?: string;
}

interface DocumentActionsCellProps {
  document: documentItem_fragment$data;
}

const DocumentActionsCell = ({ document }: DocumentActionsCellProps) => {
  const { settings } = useContext(SettingsContext);
  const { serviceInstance, translationKey, setIntegrationType } =
    useServiceContext();
  const t = useTranslations();
  const router = useRouter();
  const [openSheet, setOpenSheet] = useState(false);

  const userCanUpdate = useServiceCapability(
    ServiceRestriction.Upload,
    serviceInstance
  );
  const userCanDelete = useServiceCapability(
    ServiceRestriction.Delete,
    serviceInstance
  );

  const onClickOnUpdate = () => {
    if (isIntegrationItem(document)) {
      setIntegrationType(
        (document.integration_type as IntegrationType) ??
          IntegrationType.CsvFeed
      );
    }

    setOpenSheet(true);
  };

  const context = useDocumentContext({
    serviceInstance,
    type: document.type as ShareableResourceType,
  });

  function onDeleteCompleted() {
    revalidatePathActions([
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    ]).then(() => {
      router.push(
        `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`
      );
    });
    toast({
      title: t('Utils.Success'),
      description: t(`${translationKey}.Actions.Deleted`, {
        name: document.name ?? '',
      }),
    });
  }

  return (
    <div className="flex items-center gap-xs">
      <ShareLinkButton
        documentId={document.id}
        url={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
      />
      <IconActions
        className="z-[2]"
        icon={
          <>
            <MoreVertIcon className="h-4 w-4 text-primary" />
            <span className="sr-only">{t('Utils.OpenMenu')}</span>
          </>
        }>
        {userCanUpdate && (
          <IconActionsItem onClick={() => onClickOnUpdate()}>
            {t('MenuActions.Update')}
          </IconActionsItem>
        )}
        {userCanDelete && (
          <ServiceDelete
            type={'menuitem'}
            userCanDelete={userCanDelete}
            onDelete={() =>
              context.handleDeleteSheet(document, onDeleteCompleted)
            }
            serviceName={serviceInstance.name}
            integrationType={
              (isIntegrationItem(document)
                ? document.integration_type
                : document.type) as CardTypeEnum
            }
          />
        )}
      </IconActions>
      {userCanUpdate && (
        <ServiceManageSheet
          document={document}
          open={openSheet}
          setOpen={setOpenSheet}
        />
      )}
    </div>
  );
};

const DocumentList = ({ documents, displayMode, connectionId }: DocumentListProps) => {
  const { settings } = useContext(SettingsContext);
  const { serviceInstance } = useServiceContext();
  const t = useTranslations();
  const columns: ColumnDef<documentItem_fragment$data>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: t('Service.List.Tab.Name'),
        cell: ({ row }) => <DocumentNameCell document={row.original} />,
      },
      {
        accessorKey: 'short_description',
        id: 'short_description',
        header: t('Service.List.Tab.Description'),
        cell: ({ row }) => (
          <DocumentShortDescriptionCell document={row.original} />
        ),
      },
      {
        accessorKey: 'use_cases',
        id: 'use_cases',
        header: t('Service.List.Tab.UseCases'),
        cell: ({ row }) => {
          const document = row.original;

          return (
            <BadgeOverflowCounter
              formatLabel={false}
              badges={document.use_cases as BadgeOverflow[]}
              className="z-2 shrink-0"
            />
          );
        },
      },
      {
        accessorKey: 'action',
        id: 'action',
        header: t('Service.List.Tab.Actions'),
        cell: ({ row }) => <DocumentActionsCell document={row.original} />,
      },
    ],
    [t]
  );

  const tableColumns = useMemo(
    () =>
      buildMetadataColumns({
        columns,
        documents,
        t,
      }),
    [columns, documents, t]
  );

  return (
    <>
      {displayMode === ServiceListDisplayModeEnum.Tab ? (
        <ul
          className={
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
          }>
          {documents.map((document) => (
            <ServiceCard
              key={document.id}
              document={document}
              connectionId={connectionId}
              detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${document.id}`}
              shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
            />
          ))}
        </ul>
      ) : (
        <DataTable
          columns={tableColumns}
          data={documents}
        />
      )}
    </>
  );
};

export default DocumentList;
