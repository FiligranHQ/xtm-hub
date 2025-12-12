import { registeredPlatformByServiceInstanceIdFragment } from '@/components/registration/register/register.graphql';
import { TrialsManageUsersDialog } from '@/components/service/trial-instances/manage-users/trials-manage-users-dialog';
import { CancelDeploymentRequestMutation } from '@/components/service/trial-instances/trial-instances.graphql';
import { AlertDialogComponent } from '@/components/ui/alert-dialog';
import { formatDate } from '@/utils/date';
import { formatTitleCase } from '@/utils/format/case';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { registeredPlatformByServiceInstanceId_fragment$key } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { trialInstancesCancelDeploymentRequestMutation } from '@generated/trialInstancesCancelDeploymentRequestMutation.graphql';
import { toast } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';
import { useFragment, useMutation } from 'react-relay';

interface Props {
  registeredPlatform: registeredPlatformByServiceInstanceId_fragment$key;
}

export const TrialDetails: React.FC<Props> = ({ registeredPlatform }) => {
  const t = useTranslations();
  const platform =
    useFragment<registeredPlatformByServiceInstanceId_fragment$key>(
      registeredPlatformByServiceInstanceIdFragment,
      registeredPlatform
    );
  const [cancelDeploymentRequestMutation] =
    useMutation<trialInstancesCancelDeploymentRequestMutation>(
      CancelDeploymentRequestMutation
    );

  const cancelTrial = () => {
    cancelDeploymentRequestMutation({
      variables: {
        deploymentRequestId: platform.deployment_request!.id,
      },

      onCompleted: (response) => {
        if (response.cancelDeploymentRequest?.counts_in_orga_quota) {
          toast({
            title: t('Utils.Success'),
            description: t(
              'Service.Trials.Cancellation.Toast.NoNewTrialPossible'
            ),
          });
        } else {
          toast({
            title: t('Utils.Success'),
            description: t(
              'Service.Trials.Cancellation.Toast.NewTrialPossible'
            ),
          });
        }
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
    });
  };

  const isCancellable =
    platform.deployment_request &&
    ![
      DeploymentRequestHubStatusEnum.EXPIRED,
      DeploymentRequestHubStatusEnum.CANCELLED,
    ].includes(
      platform.deployment_request?.hub_status as DeploymentRequestHubStatusEnum
    );

  const isCancellationDefinitive =
    DeploymentRequestHubStatusEnum.ACTIVE ===
    (platform.deployment_request?.hub_status as DeploymentRequestHubStatusEnum);

  return (
    <section className="flex justify-between p-xl border border-solid border-blue rounded">
      <ul className="text-sm flex flex-col gap-l">
        {platform.title && (
          <li>
            <span className="text-gray/60">Platform name:</span>{' '}
            {platform.title}
          </li>
        )}
        {platform.deployment_request?.hub_status && (
          <li>
            <span className="text-gray/60">Status:</span>{' '}
            {formatTitleCase(platform.deployment_request?.hub_status)}
            {isCancellable && (
              <AlertDialogComponent
                AlertTitle={t('Service.Trials.Cancellation.Confirmation.Title')}
                triggerElement={
                  <Button variant="link-destructive">Cancel</Button>
                }
                onClickContinue={() => cancelTrial()}>
                {isCancellationDefinitive
                  ? t(
                      'Service.Trials.Cancellation.Confirmation.NoNewTrialPossible'
                    )
                  : t(
                      'Service.Trials.Cancellation.Confirmation.NewTrialPossible'
                    )}
              </AlertDialogComponent>
            )}
          </li>
        )}
        <li>
          <span className="text-gray/60">Start date:</span>{' '}
          {platform.subscription?.start_date && platform.subscription.end_date
            ? formatDate(platform.subscription.start_date)
            : '-'}
        </li>
        <li>
          <span className="text-gray/60">End date:</span>{' '}
          {platform.subscription?.end_date
            ? formatDate(platform.subscription?.end_date)
            : '-'}
        </li>
        {platform.deployment_request?.region && (
          <li>
            <span className="text-gray/60">Region:</span>{' '}
            {t(`Region.${platform.deployment_request.region.toUpperCase()}`)}
          </li>
        )}
        <li>
          <span className="text-gray/60">License:</span> Enterprise Edition
        </li>
      </ul>
      {platform.deployment_request?.hub_status ===
        DeploymentRequestHubStatusEnum.ACTIVE &&
        platform.url && (
          <div className="flex flex-col gap-m">
            <Button>
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={platform.url}>
                Access OpenCTI
              </Link>
            </Button>

            <TrialsManageUsersDialog platform={platform} />
          </div>
        )}
    </section>
  );
};
