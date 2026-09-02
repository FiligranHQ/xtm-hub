'use client';

import VotingRounds from '@/components/admin/voting-round/VotingRounds';
import GuardCapacityComponent from '@/components/AdminGuard';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { PortalCapability } from '@graphql/generated';
import { useTranslations } from 'next-intl';

const breadcrumbValue = [
  { label: 'MenuLinks.Settings' },
  { label: 'MenuLinks.VotingRound' },
];

export const dynamic = 'force-dynamic';

const Page = () => {
  const t = useTranslations();
  return (
    <GuardCapacityComponent
      portalCapabilityRestriction={[PortalCapability.Bypass]}
      displayError>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1 className="sr-only">{t('MenuLinks.VotingRound')}</h1>
      <VotingRounds />
    </GuardCapacityComponent>
  );
};

export default Page;
