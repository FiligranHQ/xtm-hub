'use client';
import PublicPathError from '@/components/public-path-error';
import { RelayProvider } from '@/relay/RelayProvider';
import '@filigran/ui/theme.css';
import { usePathname } from 'next/navigation';
import '../styles/globals.css';

export default function NotFound() {
  const pathname = usePathname();
  return (
    <RelayProvider>
      <PublicPathError
        error={{
          name: 'PageNotFoundError',
          message: `An user try to reach this unknown path: ${pathname}`,
        }}
      />
    </RelayProvider>
  );
}
