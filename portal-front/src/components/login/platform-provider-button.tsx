import useDecodedQuery from '@/hooks/useDecodedQuery';
import { VpnKeyIcon } from 'filigran-icon';
import { Button } from 'filigran-ui';
import Link from 'next/link';
import { FunctionComponent } from 'react';

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
  const { redirect } = useDecodedQuery();
  return (
    <Button
      key={platformProvider.provider}
      variant="outline"
      className="text-secondary border-secondary fit-content text-xs h-8 px-2 leading-none">
      <VpnKeyIcon className="w-5 h-5 mr-2" />
      <Link
        type="submit"
        href={`/auth/${platformProvider.provider}${redirect ? `?redirect=${redirect}` : ''}`}>
        {platformProvider.name}
      </Link>
    </Button>
  );
};
