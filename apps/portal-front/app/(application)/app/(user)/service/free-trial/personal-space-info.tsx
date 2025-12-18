'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import { useTranslations } from 'next-intl';
import React, { useContext } from 'react';
import SvgInfo from './SvgInfo';

const PersonalSpaceInfo: React.FC = () => {
  const { isPersonalSpace } = useContext(PortalContext);
  const t = useTranslations();
  if (!isPersonalSpace) return;
  return (
    <div className="border border-solid border-blue rounded text-blue flex items-center gap-xs p-s text-sm mt-4">
      {/*TODO: replace by the one from filigran-icon once available*/}
      <SvgInfo className="shrink-0 h-4 w-4 mr-xs" />
      {t('Service.Trials.InfoPersonalSpace')}
    </div>
  );
};

export default PersonalSpaceInfo;
