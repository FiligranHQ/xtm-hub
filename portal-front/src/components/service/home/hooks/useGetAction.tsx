import GuardCapacityComponent from '@/components/admin-guard';
import { PortalContext } from '@/components/me/app-portal-context';
import { UserServiceCreateMutation } from '@/components/service/user_service.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { ServiceInstanceJoinTypeEnum } from '@generated/models/ServiceInstanceJoinType.enum';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { useMutation } from 'react-relay';

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
      [
        ServiceInstanceJoinTypeEnum.JOIN_SELF,
        ServiceInstanceJoinTypeEnum.JOIN_AUTO,
      ].includes((service.join_type as ServiceInstanceJoinTypeEnum) ?? '')
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
      [
        ServiceInstanceJoinTypeEnum.JOIN_SELF,
        ServiceInstanceJoinTypeEnum.JOIN_AUTO,
      ].includes(service.join_type as ServiceInstanceJoinTypeEnum) && (
        <GuardCapacityComponent
          capacityRestriction={[
            OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
            OrganizationCapabilityEnum.MANAGE_SUBSCRIPTION,
          ]}>
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
