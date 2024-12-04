import { UseTranslationsProps } from '@/i18n/config';
import { DatatableI18nKey } from 'filigran-ui';

export const i18nKey = (
  t: UseTranslationsProps
): Partial<DatatableI18nKey> => ({
  'Rows per page': t('Datatable.RowsPerPage'),
  'Manage columns visibility': t('Datatable.ManageColumnsVisibility'),
  Asc: t('Datatable.Asc'),
  Desc: t('Datatable.Desc'),
  Hide: t('Datatable.Hide'),
  'Go to first page': t('Datatable.goFirstPage'),
  'Go to previous page': t('Datatable.goPreviousPage'),
  'Go to next page': t('Datatable.goNextPage'),
  'Go to last page': t('Datatable.goLastPage'),
  Columns: t('Datatable.Columns'),
});
