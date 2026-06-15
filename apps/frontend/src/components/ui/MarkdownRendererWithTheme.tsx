'use client';

import { MarkdownRenderer } from '@filigran/ui/clients';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface MarkdownRendererWithThemeProps {
  source: string;
  className?: string;
}

/**
 * Renders markdown content with theme awareness, safe for SSR.
 *
 * Defaults to 'dark' during SSR and the initial client render to avoid the
 * classic next-themes hydration mismatch (the server has no access to
 * localStorage but next-themes reads it synchronously on the client). After
 * mount, the user's `resolvedTheme` is applied. Only an explicit `'light'`
 * switches the markdown to light mode, matching XTM Hub's dark-first default.
 *
 * Note: this wrapper is intended for **app** pages where the user can switch
 * themes via Preferences. For **public** pages with a fixed dark design (e.g.
 * under `app/(public)`), prefer using `<MarkdownRenderer colorMode="dark" />`
 * directly to avoid any theme dependency.
 */
const MarkdownRendererWithTheme = ({
  source,
  className,
}: MarkdownRendererWithThemeProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colorMode: 'light' | 'dark' = !mounted
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