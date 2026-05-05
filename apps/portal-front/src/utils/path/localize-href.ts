import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';

export const LOCALIZED_PUBLIC_PATH_SEGMENTS = [
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
  'openaev-free-trial',
  'opencti-free-trial',
  'xtm-suite-roadmap',
] as const;

export const localizePublicHref = (href: string, locale: string): string => {
  if (!href.startsWith('/')) {
    return href;
  }
  const firstSegment = href.split('/')[1] ?? '';
  if (
    LOCALIZED_PUBLIC_PATH_SEGMENTS.includes(
      firstSegment as (typeof LOCALIZED_PUBLIC_PATH_SEGMENTS)[number]
    )
  ) {
    return `/${locale}${href}`;
  }
  return href;
};
