'use client';
import { PortalContext } from '@/components/me/AppPortalContext';
import { InfoIcon } from '@filigran/icon';
import { useContext } from 'react';

import { useTranslate } from '@tolgee/react';
const PersonalSpaceInfo = () => {
  const { isPersonalSpace } = useContext(PortalContext);
  const { t } = useTranslate();
  if (!isPersonalSpace) return;
  return (
    <div className="border border-solid border-blue rounded text-primary flex items-center gap-xs p-s text-sm mt-4">
      <InfoIcon className="shrink-0 h-4 w-4 mr-xs" />
      {t('Service_Trials_InfoPersonalSpace')}
    </div>
  );
};

export default PersonalSpaceInfo;
