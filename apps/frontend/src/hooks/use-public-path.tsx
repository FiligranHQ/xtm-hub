import { publicLocales } from '@/i18n/config';
import { usePathname } from 'next/navigation';

const LOCALE_PREFIX_REGEX = new RegExp(`^/(${publicLocales.join('|')})(?=/|$)`);

const usePublicPath = () => {
  const pathname = usePathname();
  const normalized = pathname.replace(LOCALE_PREFIX_REGEX, '');
  const publicPaths = [
    'cybersecurity-solutions',
    // Add more as needed
  ];
  return publicPaths.some(
    (path) => normalized === `/${path}` || normalized.startsWith(`/${path}/`)
  );
};

export default usePublicPath;
