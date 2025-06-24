import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { ObasScenarioAddSheet } from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-add-sheet';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface ObasScenarioButtonsProps {
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  firstObasScenarioSubscriptionId: string;
  connectionId: string;
}
const ObasScenarioButtons = ({
  serviceInstance,
  firstObasScenarioSubscriptionId,
  connectionId,
}: ObasScenarioButtonsProps) => {
  const t = useTranslations();

  const canManageService = serviceInstance.capabilities.includes(
    GenericCapabilityName.MANAGE_ACCESS
  );
  return (
    <>
      {canManageService && (
        <Button
          asChild
          variant="outline">
          <Link
            href={`/manage/service/${serviceInstance.id}/subscription/${firstObasScenarioSubscriptionId}`}>
            {t('Service.Capabilities.ManageAccessName')}
          </Link>
        </Button>
      )}
      <ObasScenarioAddSheet
        serviceInstance={serviceInstance}
        connectionId={connectionId}
      />
    </>
  );
};

export default ObasScenarioButtons;
