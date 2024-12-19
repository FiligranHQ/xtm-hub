import useDecodedQuery from '@/hooks/useDecodedQuery';
import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FunctionComponent, useEffect } from 'react';

interface LoginButtonProviderProps {
  platformProvider: {
    name: string;
    provider: string;
    type: string;
  };
}

export const PlatformProviderButton: FunctionComponent<
  LoginButtonProviderProps
> = ({ platformProvider }) => {
  const router = useRouter();
  const { pathname } = useDecodedQuery();
  const currentPath = usePathname();

  useEffect(() => {
    if (pathname) {
      router.push(pathname);
    }
  }, [currentPath]);

  return (
    <Button
      key={platformProvider.provider}
      variant="outline"
      className="text-secondary border-secondary fit-content"
      asChild>
      <Link
        type="submit"
        href={`/auth/${platformProvider.provider}`}>
        {platformProvider.name}
      </Link>
    </Button>
  );
};
