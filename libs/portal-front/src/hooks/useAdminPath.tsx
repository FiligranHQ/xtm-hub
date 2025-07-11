import useAdminByPass from '@/hooks/useAdminByPass';
import { usePathname } from 'next/navigation';

const useAdminPath = () => {
  const pathname = usePathname();
  return useAdminByPass() && pathname.includes('admin');
};

export default useAdminPath;
