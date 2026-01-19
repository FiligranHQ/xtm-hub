'use client';
import { ReachSalesMutation } from '@/components/service/trial-instances/reach-sales.graphql';
import { DialogInformative } from '@/components/ui/dialog';
import { ArrowRightAltIcon } from '@filigran/icon';
import { toast } from '@filigran/ui';
import { Button, GradientButton } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useMutation } from 'react-relay';

interface ReachSalesButtonProps {
  variant: 'default' | 'gradient' | 'outline-primary';
}

export const ReachSalesButton = ({ variant }: ReachSalesButtonProps) => {
  const t = useTranslations();
  const [commitReachSalesMutation, isInFlight] =
    useMutation(ReachSalesMutation);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const reachSalesButton = useMemo(() => {
    const handleReachSales = () => {
      commitReachSalesMutation({
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
    if ('gradient' === variant) {
      return (
        <GradientButton
          onClick={handleReachSales}
          disabled={isInFlight}>
          {t('Service.Trials.ReachOutToSales')}
        </GradientButton>
      );
    }

    if ('outline-primary' === variant) {
      return (
        <Button
          onClick={handleReachSales}
          variant="outline-primary"
          disabled={isInFlight}>
          {t('Service.Trials.ReachOutToSales')}
        </Button>
      );
    }

    return (
      <Button
        onClick={handleReachSales}
        className="ml-xl bg-white text-black hover:bg-white text-[12px] px-2 py-0.5 min-h-0 h-auto"
        disabled={isInFlight}>
        {t('Service.Trials.ReachOutToSales')}
        <ArrowRightAltIcon className="ml-s size-4" />
      </Button>
    );
  }, [variant, commitReachSalesMutation, isInFlight, t]);

  return (
    <>
      {reachSalesButton}
      <DialogInformative
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={t('Service.Trials.ReachOutToSalesSuccessTitle')}>
        {t('Service.Trials.ReachOutToSalesSuccessMessage')}
      </DialogInformative>
    </>
  );
};
