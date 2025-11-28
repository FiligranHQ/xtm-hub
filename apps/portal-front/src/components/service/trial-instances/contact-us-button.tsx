'use client';
import { ContactUsMutation } from '@/components/service/trial-instances/contact-us.graphql';
import { DialogInformative } from '@/components/ui/dialog';
import { toast } from 'filigran-ui';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { useMutation } from 'react-relay';

export const ContactUsButton: React.FC = () => {
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
      <Button
        onClick={handleContactUs}
        variant="outline-primary"
        disabled={isInFlight}>
        {t('Service.Trials.ContactUs')}
      </Button>
      <DialogInformative
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={t('Service.Trials.ContactUsSuccessTitle')}>
        {t('Service.Trials.ContactUsSuccessMessage')}
      </DialogInformative>
    </>
  );
};
