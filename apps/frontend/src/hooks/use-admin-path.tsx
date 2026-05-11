import { usePathname } from 'next/navigation';
import { useAdminByPass } from '@/hooks/use-portal-capability';

const useAdminPath = () => {
  const pathname = usePathname();
  return useAdminByPass() && pathname.includes('admin');
};

export default useAdminPath;
