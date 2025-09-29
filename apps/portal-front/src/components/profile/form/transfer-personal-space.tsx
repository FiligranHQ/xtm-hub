import { MeTransferPersonalSpaceMutation } from '@/components/me/me.graphql';
import { FiligranLoader } from 'filigran-icon';
import { toast } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FunctionComponent, useEffect } from 'react';
import { useMutation } from 'react-relay';

interface TransferPersonalSpaceProps {
  from: string | null;
  to: string | null;
}

export const TransferPersonalSpace: FunctionComponent<
  TransferPersonalSpaceProps
> = ({ from, to }) => {
  const router = useRouter();

  const t = useTranslations();
  const [commitTransferPersonalSpaceMutation] = useMutation(
    MeTransferPersonalSpaceMutation
  );
  useEffect(() => {
    if (from && to) {
      commitTransferPersonalSpaceMutation({
        variables: {
          from: from,
          to: to,
        },
        onError(error) {
          toast({
            variant: 'destructive',
            title: t('Utils.Error'),
            description: t(`Error.Server.${error.message}`),
          });
        },
        onCompleted() {
          toast({
            title: t('ProfilePage.PersonalSpace.SuccessTransfer'),
          });

          router.push('/app');
        },
      });
    }
  }, [from, to]);
  return (
    <div className="absolute inset-0 z-50 m-auto h-20 w-20">
      <FiligranLoader />
    </div>
  );
};
