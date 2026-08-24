'use client';

import { ArrowUpwardIcon } from '@filigran/icon';
import { Button } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { AddTrialUserDialog } from './AddTrialUserDialog';

interface ManageTrialHeaderProps {
  serviceInstanceId: string;
}

export const ManageTrialHeader = ({
  serviceInstanceId,
}: ManageTrialHeaderProps) => {
  const t = useTranslations();
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  return (
    <header className="flex flex-col gap-l">
      <div className="flex flex-col gap-xs">
        <p className="heading-sm w-fit bg-clip-text text-transparent bg-gradient-focus">
          {t('Service.Bundle.ManageTrial.Eyebrow')}
        </p>
        <h1 className="heading-2xl">{t('Service.Bundle.ManageTrial.Title')}</h1>
        <p className="text-content-body-base max-w-3xl">
          {t('Service.Bundle.ManageTrial.Description')}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-m">
        <Button
          variant="outline"
          className="gap-s border-elevation-border-default-layer-0"
          asChild>
          <Link href="/service/xtm-platform-trial">
            <ArrowUpwardIcon className="h-3 w-3 -rotate-90" />
            {t('Service.Bundle.ManageTrial.BackButton')}
          </Link>
        </Button>
        <div className="flex flex-wrap gap-s">
          <Button
            variant="outline"
            className="border-elevation-border-default-layer-0">
            {t('Service.Bundle.ManageTrial.GroupAction')}
          </Button>
          <Button
            variant="default"
            onClick={() => setIsAddUserDialogOpen(true)}>
            {t('Service.Bundle.ManageTrial.AddTrialUser')}
          </Button>
        </div>
      </div>
      <AddTrialUserDialog
        serviceInstanceId={serviceInstanceId}
        open={isAddUserDialogOpen}
        setOpen={setIsAddUserDialogOpen}
      />
    </header>
  );
};
