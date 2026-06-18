'use client';

import { MarkdownRenderer } from '@filigran/ui/clients';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

interface MarkdownRendererWithThemeProps {
  source: string;
  className?: string;
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

const MarkdownRendererWithTheme = ({
  source,
  className,
}: MarkdownRendererWithThemeProps) => {
  const { resolvedTheme } = useTheme();
  const isMounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const colorMode: 'light' | 'dark' = !isMounted
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
