import useGranted from '@/hooks/useGranted';
import { usePathname } from 'next/navigation';

const useAdminPath = () => {
  const pathname = usePathname();
  return useGranted('BYPASS') && pathname.includes('admin');
};

export default useAdminPath;
