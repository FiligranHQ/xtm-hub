'use client';

import { ThreatPulseDashboard } from '@/components/admin/threat-pulse/ThreatPulseDashboard';
import GuardCapacityComponent from '@/components/AdminGuard';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { useTranslate } from '@/hooks/use-translate';
import { PortalCapability } from '@graphql/generated';

const breadcrumbValue = [
  { label: 'MenuLinks.Settings' },
  { label: 'MenuLinks.ThreatPulse' },
];

export const dynamic = 'force-dynamic';

const Page = () => {
  const t = useTranslate();
  return (
    <GuardCapacityComponent
      portalCapabilityRestriction={[PortalCapability.Bypass]}
      displayError>
      <BreadcrumbNav value={breadcrumbValue} />
      <h1>{t('MenuLinks.ThreatPulse')}</h1>
      <ThreatPulseDashboard />
    </GuardCapacityComponent>
  );
};

export default Page;
