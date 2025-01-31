'use client';

import { CustomDashboardForm } from '@/components/service/custom-dashboards/custom-dashboard-form';
import { i18nKey } from '@/utils/datatable';
import { DataTable } from 'filigran-ui';
import { useTranslations } from 'next-intl';

const PageLoader = () => {
  const t = useTranslations();
  return (
    <DataTable
      i18nKey={i18nKey(t)}
      data={[]}
      columns={[]}
      isLoading={true}
      toolbar={
        <div className="flex-col-reverse sm:flex-row flex items-center justify-between gap-s">
          <div className="justify-between flex w-full sm:w-auto items-center gap-s">
            <CustomDashboardForm connectionId={''} />
          </div>
        </div>
      }
    />
  );
};

// Component export
export default PageLoader;
