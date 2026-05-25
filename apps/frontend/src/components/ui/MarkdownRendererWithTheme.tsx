'use client';

import { MarkdownRenderer } from '@filigran/ui/clients';
import { useTheme } from 'next-themes';

interface MarkdownRendererWithThemeProps {
  source: string;
  className?: string;
}

const MarkdownRendererWithTheme = ({
  source,
  className,
}: MarkdownRendererWithThemeProps) => {
  const { resolvedTheme } = useTheme();
  return (
    <MarkdownRenderer
      source={source}
      colorMode={resolvedTheme === 'dark' ? 'dark' : 'light'}
      className={className}
    />
  );
};

export default MarkdownRendererWithTheme;
