'use client';

import { cn } from '@/components/filigran-ui/lib/utils';
import MDEditor from '@uiw/react-md-editor';

interface MarkdownRendererProps {
  source: string;
  colorMode?: 'light' | 'dark';
  className?: string;
  transformLinkHref?: (href: string) => string;
}

const MarkdownRenderer = ({
  source,
  colorMode = 'dark',
  className,
  transformLinkHref,
}: MarkdownRendererProps) => (
  <div
    data-color-mode={colorMode}
    className={cn(className)}>
    <MDEditor.Markdown
      source={source}
      style={{ backgroundColor: 'transparent' }}
      components={
        transformLinkHref
          ? {
              a: ({ node: _node, href, ...props }) => (
                <a
                  {...props}
                  href={href ? transformLinkHref(href) : href}
                />
              ),
            }
          : undefined
      }
    />
  </div>
);

export { MarkdownRenderer };
