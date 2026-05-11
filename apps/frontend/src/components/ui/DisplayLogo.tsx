import LogoXTMDark from '@public/logo_xtm_hub_dark.svg';
import LogoXTMLight from '@public/logo_xtm_hub_light.svg';
import { useTheme } from 'next-themes';

interface DisplayLogoProps {
  className?: string;
}

export const DisplayLogo = ({ className }: DisplayLogoProps) => {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === 'light' ? (
    <LogoXTMLight className={className} />
  ) : (
    <LogoXTMDark className={className} />
  );
};
