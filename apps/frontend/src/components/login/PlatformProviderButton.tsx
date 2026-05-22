import useDecodedQuery from '@/hooks/use-decoded-query';
import { VpnKeyIcon } from '@filigran/icon';
import { Button } from '@filigran/ui';

interface LoginButtonProviderProps {
  platformProvider: {
    name: string;
    provider: string;
    type: string;
  };
}

export const PlatformProviderButton = ({
  platformProvider,
}: LoginButtonProviderProps) => {
  const { redirect } = useDecodedQuery();
  return (
    <Button
      asChild
      key={platformProvider.provider}
      variant="outline"
      className="text-secondary border-secondary fit-content text-xs h-8 px-2 leading-none">
      <a
        href={`/auth/${platformProvider.provider}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
        <VpnKeyIcon className="w-5 h-5 mr-2" />
        {platformProvider.name}
      </a>
    </Button>
  );
};
