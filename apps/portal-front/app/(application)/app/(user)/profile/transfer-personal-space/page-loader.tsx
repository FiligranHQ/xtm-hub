'use client';
import { TransferPersonalSpace } from '@/components/profile/form/transfer-personal-space';
import { useSearchParams } from 'next/navigation';

const PageLoader = () => {
  const searchParams = useSearchParams();

  const requestId = searchParams.get('id');

  return <TransferPersonalSpace requestId={requestId} />;
};

export default PageLoader;
