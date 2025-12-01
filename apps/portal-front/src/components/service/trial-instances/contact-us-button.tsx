'use client';
import { ContactUsMutation } from '@/components/service/trial-instances/contact-us.graphql';
import { DialogInformative } from '@/components/ui/dialog';
import { ArrowRightAltIcon } from 'filigran-icon';
import { toast } from 'filigran-ui';
import { Button, GradientButton } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useMutation } from 'react-relay';

interface ContactUsButtonProps {
  variant: 'default' | 'gradient';
}

export const ContactUsButton = ({ variant }: ContactUsButtonProps) => {
  const t = useTranslations();
  const [commitContactUsMutation, isInFlight] = useMutation(ContactUsMutation);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleContactUs = () => {
    commitContactUsMutation({
      variables: {},
      onError(error) {
        toast({
          variant: 'destructive',
          title: t('Utils.Error'),
          description: t(`Error.Server.${error.message}`),
        });
      },
      onCompleted() {
        setIsDialogOpen(true);
      },
    });
  };

  return (
    <>
      {(variant === 'default' && (
        <Button
          onClick={handleContactUs}
          className="ml-xl bg-white text-black hover:bg-white text-[12px] px-2 py-0.5 min-h-0 h-auto"
          disabled={isInFlight}>
          {t('Service.Trials.ContactUs')}
          <ArrowRightAltIcon className="ml-s size-4" />
        </Button>
      )) || (
        <GradientButton
          onClick={handleContactUs}
          disabled={isInFlight}>
          {t('Service.Trials.ContactUs')}
        </GradientButton>
      )}
      <DialogInformative
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={t('Service.Trials.ContactUsSuccessTitle')}>
        {t('Service.Trials.ContactUsSuccessMessage')}
      </DialogInformative>
    </>
  );
};
