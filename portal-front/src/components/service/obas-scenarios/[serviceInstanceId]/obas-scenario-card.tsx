'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { ObasScenarioUpdateSheet } from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-update-sheet';
import { IconActions } from '@/components/ui/icon-actions';
import ShareableResourceCard from '@/components/ui/shareable-resource/shareable-resource-card';
import useServiceCapability from '@/hooks/useServiceCapability';
import { obasScenariosItem_fragment$data } from '@generated/obasScenariosItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';

interface ObasScenarioCardProps {
  obasScenario: obasScenariosItem_fragment$data;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  detailUrl: string;
  shareLinkUrl: string;
  connectionId: string;
}

const ObasScenarioCard = ({
  obasScenario,
  serviceInstance,
  detailUrl,
  shareLinkUrl,
  connectionId,
}: ObasScenarioCardProps) => {
  const t = useTranslations();

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );

  const onDelete = () => {
    toast({
      title: t('Utils.Success'),
      description: t('Service.ObasScenario.Actions.Deleted', {
        name: obasScenario.name,
      }),
    });
  };

  return (
    <ShareableResourceCard
      key={obasScenario.id}
      document={obasScenario}
      detailUrl={detailUrl}
      shareLinkUrl={shareLinkUrl}
      serviceInstance={serviceInstance}
      extraContent={
        (userCanUpdate || userCanDelete) && (
          <IconActions
            className="z-[2]"
            icon={
              <>
                <MoreVertIcon className="h-4 w-4 text-primary" />
                <span className="sr-only">{t('Utils.OpenMenu')}</span>
              </>
            }>
            <ObasScenarioUpdateSheet
              onDelete={onDelete}
              connectionId={connectionId}
              variant="menu"
              obasScenario={obasScenario}
              serviceInstance={serviceInstance}
            />
          </IconActions>
        )
      }
    />
  );
};

export default ObasScenarioCard;
