'use client';
import { usePathname } from 'next/navigation';
import PublicPathError from '@/components/PublicPathError';
import { RelayProvider } from '@/relay/relay-provider';
export default function Error({
  error,
}: {
  error: Error & { digest?: string; componentStack?: string };
}) {
  const pathname = usePathname();
  return (
    <RelayProvider>
      <PublicPathError
        error={{
          ...error,
          message: `An user try to reach this unknown path: ${pathname}`,
        }}
      />
    </RelayProvider>
  );
}
