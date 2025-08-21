'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { Button, toast } from 'filigran-ui';

import { useServiceContext } from '@/components/service/components/service-context';
import { ServiceFormValues } from '@/components/service/components/subscribable-services.types';
import { IconActionsButton } from '@/components/ui/icon-actions';
import { SheetWithPreventingDialog } from '@/components/ui/sheet-with-preventing-dialog';
import useServiceCapability from '@/hooks/useServiceCapability';
import revalidatePathActions from '@/utils/actions/revalidatePath.actions';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { SubscribableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ServiceManageSheetProps {
  document?: SubscribableResource;
  variant?: 'menu' | 'button';
}

export const ServiceManageSheet = ({
  document,
  variant,
}: ServiceManageSheetProps) => {
  const router = useRouter();
  const t = useTranslations();
  const [openSheet, setOpenSheet] = useState(false);

  const {
    serviceInstance,
    translationKey,
    ServiceForm,
    handleAddSheet,
    handleDeleteSheet,
    handleUpdateSheet,
  } = useServiceContext();

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );

  function onDeleteCompleted() {
    revalidatePathActions([
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    ]).then(() => {
      router.push(
        `/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}`
      );
    });
    setOpenSheet(false);
    toast({
      title: t('Utils.Success'),
      description: t(`${translationKey}.Actions.Deleted`, {
        name: document?.name ?? '',
      }),
    });
  }

  function onUpdateSuccess(serviceName: string) {
    // If the service has changed, we need to revalidate the path
    // If the slug has changed, it's necessary to revalidate the previous path, as the new one may not yet be cached.
    revalidatePathActions([
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document!.slug}`,
      `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}`,
    ]);
    setOpenSheet(false);
    toast({
      title: t('Utils.Success'),
      description: t('VaultActions.DocumentUpdated', {
        file_name: serviceName,
      }),
    });
  }
  function onError(error: Error) {
    toast({
      variant: 'destructive',
      title: t('Utils.Error'),
      description: t(`Error.Server.${error.message}`),
    });
  }

  function onCreateSuccess(serviceName: string) {
    setOpenSheet(false);

    toast({
      title: t('Utils.Success'),
      description: t(`${translationKey}.Actions.Added`, {
        name: serviceName,
      }),
    });
  }

  // we are in update/delete case
  if (document) {
    return (
      <>
        {(userCanUpdate || userCanDelete) && (
          <SheetWithPreventingDialog
            open={openSheet}
            setOpen={setOpenSheet}
            trigger={
              variant === 'button' ? (
                <Button variant="outline">{t('Utils.Update')}</Button>
              ) : (
                <IconActionsButton
                  className="normal-case"
                  onClick={() => {
                    setOpenSheet(true);
                  }}
                  aria-label={t('MenuActions.Update')}>
                  {t('MenuActions.Update')}
                </IconActionsButton>
              )
            }
            title={t(`${translationKey}.UpdateService`, {
              name: document.name,
            })}>
            {
              <ServiceForm
                onDelete={() => handleDeleteSheet(document, onDeleteCompleted)}
                userCanDelete={userCanDelete}
                document={document}
                handleSubmit={(values: ServiceFormValues) =>
                  handleUpdateSheet(values, document, onUpdateSuccess, onError)
                }
              />
            }
          </SheetWithPreventingDialog>
        )}
      </>
    );
  }

  // we are in new case
  return (
    <>
      {userCanUpdate && (
        <SheetWithPreventingDialog
          open={openSheet}
          setOpen={setOpenSheet}
          trigger={<Button>{t(`${translationKey}.AddService`)}</Button>}
          title={t(`${translationKey}.AddService`)}>
          {
            <ServiceForm
              handleSubmit={(values: ServiceFormValues) =>
                handleAddSheet(values, onCreateSuccess, onError)
              }
              document={undefined}
            />
          }
        </SheetWithPreventingDialog>
      )}
    </>
  );
};
