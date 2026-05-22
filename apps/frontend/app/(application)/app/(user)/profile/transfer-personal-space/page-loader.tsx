'use client';
import { useSearchParams } from 'next/navigation';
import { TransferPersonalSpace } from '@/components/profile/form/TransferPersonalSpace';

const PageLoader = () => {
  const searchParams = useSearchParams();

  const requestId = searchParams.get('id');

  return <TransferPersonalSpace requestId={requestId} />;
};

export default PageLoader;
