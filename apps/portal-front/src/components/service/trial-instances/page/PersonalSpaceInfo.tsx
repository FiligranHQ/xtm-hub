'use client';

import { InfoIcon } from '@filigran/icon';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';
import { PortalContext } from '../../../me/AppPortalContext';

const PersonalSpaceInfo: React.FC = () => {
  const { isPersonalSpace } = useContext(PortalContext);
  const t = useTranslations();
  if (!isPersonalSpace) return;
  return (
    <div className="border border-solid border-blue rounded text-blue flex items-center gap-xs p-s text-sm mt-4">
      <InfoIcon className="shrink-0 h-4 w-4 mr-xs" />
      {t('Service.Trials.InfoPersonalSpace')}
    </div>
  );
};

export default PersonalSpaceInfo;
