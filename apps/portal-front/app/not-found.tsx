'use client';
import '@filigran/ui/theme.css';
import { usePathname } from 'next/navigation';
import PublicPathError from '../src/components/PublicPathError';
import { RelayProvider } from '../src/relay/relay-provider';
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
