import {
  newPicturesSchema,
  ServiceForm,
} from '@/components/service/service-form';
import { ServiceAddPicture } from '@/components/service/service.graphql';
import { IconActionContext } from '@/components/ui/icon-actions';
import { fileListToUploadableMap } from '@/relay/environment/fetchFormData';
import { serviceAddPictureMutation } from '@generated/serviceAddPictureMutation.graphql';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { Button, useToast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent, useContext, useEffect, useState } from 'react';
import { useMutation } from 'react-relay';
import { z } from 'zod';
import { SheetWithPreventingDialog } from '../ui/sheet-with-preventing-dialog';

interface EditServiceProps {
  service: serviceList_fragment$data;
}

export const EditService: FunctionComponent<EditServiceProps> = ({
  service,
}) => {
  const t = useTranslations();
  const { toast } = useToast();
  const [openSheet, setOpenSheet] = useState<boolean | null>(null);
  const { setMenuOpen } = useContext(IconActionContext);

  useEffect(() => {
    if (!openSheet && openSheet !== null) setMenuOpen(false);
  }, [openSheet]);

  const [servicePictureMutation] =
    useMutation<serviceAddPictureMutation>(ServiceAddPicture);

  const pictureMutation = (document: FileList | undefined, isLogo: boolean) => {
    if (!document) {
      return;
    }
    servicePictureMutation({
      variables: {
        serviceId: service.id,
        document: document,
        isLogo: isLogo,
      },
      uploadables: fileListToUploadableMap(document),
      onCompleted: (response) => {
        setOpenSheet(false);
        toast({
          title: t('Utils.Success'),
          description: t('ServiceForm.PictureUpdated', {
            serviceName: response.addServicePicture?.name,
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
  const handleSubmit = (values: z.infer<typeof newPicturesSchema>) => {
    pictureMutation(values.logo_document, true);
    pictureMutation(values.illustration_document, false);
  };
  return (
    <SheetWithPreventingDialog
      open={openSheet ?? false}
      setOpen={setOpenSheet}
      trigger={
        <Button
          variant="ghost"
          className="w-full justify-start normal-case"
          aria-label={t('ServiceForm.EditService')}>
          {t('ServiceForm.UpdatePictures')}
        </Button>
      }
      title={t('ServiceForm.EditService')}>
      <ServiceForm handleSubmit={handleSubmit} />
    </SheetWithPreventingDialog>
  );
};
