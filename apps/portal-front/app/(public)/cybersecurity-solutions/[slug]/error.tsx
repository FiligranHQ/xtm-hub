'use client';
import PublicPathError from '@/components/public-path-error';
import { RelayProvider } from '@/relay/RelayProvider';
import { usePathname } from 'next/navigation';
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
