'use client';

import { useHasMounted } from '@/hooks/use-has-mounted';
import {
  FiligranWebsiteUtm,
  withFiligranWebsiteUtm,
} from '@/utils/filigran-website-utm';
import { MarkdownRenderer } from '@filigran/ui/clients';
import { useTheme } from 'next-themes';

interface MarkdownRendererWithThemeProps {
  source: string;
  className?: string;
  // Forces the color mode instead of following the theme
  colorMode?: 'light' | 'dark';
  // Tags the links to filigran.io written in the markdown
  filigranWebsiteUtm?: FiligranWebsiteUtm;
}

const MarkdownRendererWithTheme = ({
  source,
  className,
  colorMode: forcedColorMode,
  filigranWebsiteUtm,
}: MarkdownRendererWithThemeProps) => {
  const { resolvedTheme } = useTheme();
  const hasMounted = useHasMounted();

  const themeColorMode: 'light' | 'dark' = !hasMounted
    ? 'dark'
    : resolvedTheme === 'light'
      ? 'light'
      : 'dark';
  const colorMode = forcedColorMode ?? themeColorMode;

  return (
    <MarkdownRenderer
      source={source}
      colorMode={colorMode}
      className={className}
      transformLinkHref={
        filigranWebsiteUtm
          ? (href) => withFiligranWebsiteUtm(href, filigranWebsiteUtm)
          : undefined
      }
    />
  );
};

export default MarkdownRendererWithTheme;
