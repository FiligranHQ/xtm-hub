import { publicLocales } from '@/i18n/config';

export interface ResolvedServiceInstanceLink {
  href: string;
  target: '_blank' | '_self';
}

export interface ServiceInstanceLinkInput {
  url: string;
  isLinkDisabled?: boolean;
}

export const resolveBaseServiceInstanceLink = ({
  url,
  isLinkDisabled,
}: ServiceInstanceLinkInput): ResolvedServiceInstanceLink & {
  isExternal: boolean;
} => {
  const isExternal = url.startsWith('http');

  return {
    href: isLinkDisabled ? '#' : url,
    target: isExternal ? '_blank' : '_self',
    isExternal,
  };
};

export const addLocalePrefixToPath = ({
  href,
  locale,
}: {
  href: string;
  locale: string;
}): string => {
  const normalizedPath = href.startsWith('/') ? href : `/${href}`;
  const hasLocalePrefix = publicLocales.some(
    (publicLocale) =>
      normalizedPath === `/${publicLocale}` ||
      normalizedPath.startsWith(`/${publicLocale}/`)
  );

  return hasLocalePrefix ? normalizedPath : `/${locale}${normalizedPath}`;
};

export const resolvePublicServiceInstanceLink = ({
  url,
  isLinkDisabled,
  locale,
}: ServiceInstanceLinkInput & {
  locale: string;
}): ResolvedServiceInstanceLink => {
  const { href, target, isExternal } = resolveBaseServiceInstanceLink({
    url,
    isLinkDisabled,
  });

  if (isExternal || href === '#') {
    return { href, target };
  }

  return {
    href: addLocalePrefixToPath({ href, locale }),
    target,
  };
};

export const resolvePrivateServiceInstanceLink = ({
  url,
  isLinkDisabled,
}: ServiceInstanceLinkInput): ResolvedServiceInstanceLink => {
  const { href, target } = resolveBaseServiceInstanceLink({
    url,
    isLinkDisabled,
  });

  return { href, target };
};
