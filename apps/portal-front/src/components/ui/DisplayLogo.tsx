import { useTheme } from 'next-themes';
import { FunctionComponent } from 'react';
import LogoXTMDark from '../../../public/logo_xtm_hub_dark.svg';
import LogoXTMLight from '../../../public/logo_xtm_hub_light.svg';

interface DisplayLogoProps {
  className?: string;
}

export const DisplayLogo: FunctionComponent<DisplayLogoProps> = ({
  className,
}) => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'light' ? (
    <LogoXTMLight className={className} />
  ) : (
    <LogoXTMDark className={className} />
  );
};
