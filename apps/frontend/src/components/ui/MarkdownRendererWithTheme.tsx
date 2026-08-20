'use client';

import { useHasMounted } from '@/hooks/use-has-mounted';
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
  const hasMounted = useHasMounted();

  const colorMode: 'light' | 'dark' = !hasMounted
    ? 'dark'
    : resolvedTheme === 'light'
      ? 'light'
      : 'dark';

  return (
    <MarkdownRenderer
      source={source}
      colorMode={colorMode}
      className={className}
    />
  );
};

export default MarkdownRendererWithTheme;
