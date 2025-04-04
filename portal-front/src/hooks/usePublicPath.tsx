import { usePathname } from 'next/navigation';

const usePublicPath = () => {
  const pathname = usePathname();
  const publicPaths = [
    'cybersecurity-solutions',
    // Add more as needed
  ];
  return publicPaths.some((path) => pathname.includes(path));
};

export default usePublicPath;
