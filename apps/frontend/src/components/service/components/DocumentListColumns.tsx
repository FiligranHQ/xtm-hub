'use client';

import { UserDisplay } from '@/components/ui/UserDisplay';
import { UseTranslationsProps } from '@/i18n/config';
import { PublicDocumentData } from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCode, IntegrationType } from '@graphql/generated';
import { ColumnDef } from '@tanstack/react-table';

type DocumentListMetadataData = {
  integration_type?: string | null | undefined;
  product_version?: string | null | undefined;
  uploader:
    | documentItem_fragment$data['uploader']
    | PublicDocumentData['uploader']
    | null
    | undefined;
};

export const buildProductVersionColumn = <T extends DocumentListMetadataData>(
  t: UseTranslationsProps
): ColumnDef<T> => ({
  accessorKey: 'minimum_deployable_version',
  id: 'minimum_deployable_version',
  header: t('Service.List.Tab.MinimumDeployableVersion'),
  cell: ({ row }) => {
    const document = row.original;
    return (
      <span className="text-sm">
        {docHasMetadata(document, DocumentMetadataKeyCode.ProductVersion)
          ? document.product_version
          : null}
      </span>
    );
  },
});

export const buildAuthorColumn = <T extends DocumentListMetadataData>(
  t: UseTranslationsProps
): ColumnDef<T> => ({
  accessorKey: 'author_column',
  id: 'author_column',
  header: t('Service.List.Tab.Author'),
  cell: ({ row }) => (
    <UserDisplay
      displayPicture={false}
      uploader={row.original.uploader}
    />
  ),
});

export const buildMetadataColumns = <
  T extends DocumentListMetadataData,
>(params: {
  columns: ColumnDef<T>[];
  documents: T[];
  t: UseTranslationsProps;
}) => {
  const { columns, documents, t } = params;
  const nextColumns = [...columns];
  const integrationType = documents[0]?.integration_type;
  const hasProductVersionColumn = documents.some(
    (document) =>
      docHasMetadata(document, DocumentMetadataKeyCode.ProductVersion) &&
      !!document.product_version
  );

  if (integrationType !== IntegrationType.Connector) {
    nextColumns.push(buildAuthorColumn<T>(t));
  }

  if (hasProductVersionColumn) {
    nextColumns.push(buildProductVersionColumn<T>(t));
  }

  return nextColumns;
};
