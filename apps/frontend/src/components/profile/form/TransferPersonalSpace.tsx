import { MeTransferPersonalSpaceMutation } from '@/components/me/me.graphql';
import { FiligranLoader } from '@filigran/icon';
import { toast } from '@filigran/ui';
import { useTranslate } from '@tolgee/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMutation } from 'react-relay';
interface TransferPersonalSpaceProps {
  requestId: string | null;
}

export const TransferPersonalSpace = ({
  requestId,
}: TransferPersonalSpaceProps) => {
  const router = useRouter();

  const { t } = useTranslate();
  const [commitTransferPersonalSpaceMutation] = useMutation(
    MeTransferPersonalSpaceMutation
  );
  useEffect(() => {
    if (requestId) {
      commitTransferPersonalSpaceMutation({
        variables: {
          requestId,
        },
        onError(error) {
          toast({
            variant: 'destructive',
            title: t('Utils_Error'),
            description: t(`Error_Server_${error.message}`),
          });
        },
        onCompleted() {
          toast({
            title: t('ProfilePage_PersonalSpace_SuccessTransfer'),
          });

          router.push('/app');
        },
      });
    }
  }, [requestId, commitTransferPersonalSpaceMutation, router, t]);
  return (
    <div className="absolute inset-0 z-50 m-auto h-20 w-20">
      <FiligranLoader />
    </div>
  );
};
