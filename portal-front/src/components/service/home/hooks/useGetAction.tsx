import GuardCapacityComponent from '@/components/admin-guard';
import { PortalContext } from '@/components/me/app-portal-context';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { ORGANIZATION_CAPACITY } from '@/utils/constant';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { useMutation } from 'react-relay';
import { JOIN_TYPE } from '../../service.const';

export default function useGetAction(
  addSubscriptionInDb: (service: serviceList_fragment$data) => void
) {
  const t = useTranslations();
  const { me } = useContext(PortalContext);

  const [userServiceJoin] = useMutation(UserServiceCreateMutation);

  const getAction = (service: serviceList_fragment$data) => {
    if (
      !service.user_joined &&
      service.organization_subscribed &&
      [JOIN_TYPE.JOIN_SELF, JOIN_TYPE.JOIN_AUTO].includes(
        service.join_type ?? ''
      )
    ) {
      return (
        <Button
          onClick={() => {
            userServiceJoin({
              variables: {
                input: {
                  email: me?.email,
                  serviceInstanceId: service.id,
                  organizationId: me?.selected_organization_id,
                },
              },
            });
          }}>
          {t('Service.Join')}
        </Button>
      );
    }
    return (
      !service.organization_subscribed &&
      service.join_type &&
      [JOIN_TYPE.JOIN_SELF, JOIN_TYPE.JOIN_AUTO].includes(
        service.join_type
      ) && (
        <GuardCapacityComponent
          capacityRestriction={[ORGANIZATION_CAPACITY.MANAGE_SUBSCRIPTION]}>
          <AlertDialogComponent
            AlertTitle={`${t('Service.SubscribeService', {
              serviceName: service.name,
            })}`}
            actionButtonText={t('Utils.Continue')}
            triggerElement={
              <Button
                size="sm"
                onClick={(e) => e.stopPropagation()}>
                {t('Service.Subscribe')}
              </Button>
            }
            onClickContinue={() => addSubscriptionInDb(service)}>
            {t('Service.SureWantSubscriptionDirect')}
          </AlertDialogComponent>
        </GuardCapacityComponent>
      )
    );
  };

  return { getAction };
}
