'use client';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Page({ params }: { params: { provider: string[] } }) {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const redirectUrl = `http://localhost:4001/auth/${params.provider.join('/')}?${queryString}`;

  useEffect(() => {
    redirect(redirectUrl);
  }, []);

  return <></>;
}
