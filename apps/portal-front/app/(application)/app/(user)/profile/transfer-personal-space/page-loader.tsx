'use client';
import { TransferPersonalSpace } from '@/components/profile/form/transfer-personal-space';
import { useSearchParams } from 'next/navigation';

const PageLoader = () => {
  const searchParams = useSearchParams();

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  return (
    <TransferPersonalSpace
      from={from}
      to={to}
    />
  );
};

export default PageLoader;
