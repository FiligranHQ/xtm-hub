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
