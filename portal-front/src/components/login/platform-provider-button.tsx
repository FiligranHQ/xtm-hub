import useDecodedQuery from '@/hooks/useDecodedQuery';
import { useToast } from 'filigran-ui/clients';
import { Button } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
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
  const { redirect } = useDecodedQuery();
  const currentPath = usePathname();
  const { toast } = useToast();
  const t = useTranslations();
  useEffect(() => {
    if (redirect) {
      router.push(atob(redirect));

      toast({
        variant: 'destructive',
        title: t('Utils.Error'),
        description: t('Error.Disconnected'),
      });
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
