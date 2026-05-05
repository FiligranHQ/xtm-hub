import GuardCapacityComponent from '@/components/AdminGuard';
import {
  PlatformMetadataMapping,
  ServiceDefinitionIdentifierToPlatformIdentifier,
} from '@/components/registration/platform-identifier-mapping';
import { UnregisterPlatform } from '@/components/registration/register/register.graphql';
import { AlertDialogComponent } from '@/components/ui/AlertDialog';
import { toast } from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { registeredPlatformByServiceInstanceId_fragment$data } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { registerUnregisterPlatformMutation } from '@generated/registerUnregisterPlatformMutation.graphql';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMutation } from 'react-relay';

interface UnregisterButtonProps {
  platform: registeredPlatformByServiceInstanceId_fragment$data;
}

export const UnregisterButton = ({ platform }: UnregisterButtonProps) => {
  const t = useTranslations();
  const router = useRouter();

  const isTrial = platform.contract === PlatformContractEnum.TRIAL;

  const [commitUnregisterPlatform] =
    useMutation<registerUnregisterPlatformMutation>(UnregisterPlatform);

  const unregisterPlatform = () => {
    const identifier =
      ServiceDefinitionIdentifierToPlatformIdentifier[
        platform.identifier as ServiceDefinitionIdentifierEnum
      ];
    if (!identifier || !platform.platform_id) {
      toast({
        variant: 'destructive',
        title: t('Utils.Error'),
        description: t(`Unregister.Failed.Description`),
      });
      return;
    }
    commitUnregisterPlatform({
      variables: {
        input: {
          platformId: platform.platform_id,
          identifier,
          tenantId: platform.tenant_id,
        },
      },
      onCompleted: () => {
        router.push('/app');
        toast({
          title: t('Utils.Success'),
          description: t('Unregister.Succeeded.Title', {
            platformIdentifier: platform.title,
          }),
        });
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

  return (
    !isTrial && (
      <GuardCapacityComponent
        capacityRestriction={[
          OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
          OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
        ]}>
        <AlertDialogComponent
          variantName={'destructive'}
          AlertTitle={t('Unregister.Confirm.Description')}
          onClickContinue={unregisterPlatform}
          triggerElement={
            <Button variant="destructive">{t('Unregister.Unregister')}</Button>
          }
          actionButtonText={t('Utils.Continue')}>
          <p>
            {t('Unregister.Description', {
              platformName: platform.title,
              productName:
                PlatformMetadataMapping[
                  ServiceDefinitionIdentifierToPlatformIdentifier[
                    platform.identifier as ServiceDefinitionIdentifierEnum
                  ] ?? PlatformIdentifierEnum.OPENCTI
                ].name,
            })}
          </p>
        </AlertDialogComponent>
      </GuardCapacityComponent>
    )
  );
};
