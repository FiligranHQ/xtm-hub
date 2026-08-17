import { UseTranslationsProps } from '@/i18n/config';
import { DatatableI18nKey } from '@filigran/ui';

export const i18nKey = (
  t: UseTranslationsProps
): Partial<DatatableI18nKey> => ({
  'Rows per page': t('Datatable_RowsPerPage'),
  'Manage columns visibility': t('Datatable_ManageColumnsVisibility'),
  Asc: t('Datatable_Asc'),
  Desc: t('Datatable_Desc'),
  Hide: t('Datatable_Hide'),
  'Go to first page': t('Datatable_GoFirstPage'),
  'Go to previous page': t('Datatable_GoPreviousPage'),
  'Go to next page': t('Datatable_GoNextPage'),
  'Go to last page': t('Datatable_GoLastPage'),
  Columns: t('Datatable_Columns'),
  'Reset table': t('Datatable_ResetTable'),
});
