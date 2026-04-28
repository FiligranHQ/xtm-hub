import { usePathname } from 'next/navigation';
import { useAdminByPass } from './use-portal-capability';

const useAdminPath = () => {
  const pathname = usePathname();
  return useAdminByPass() && pathname.includes('admin');
};

export default useAdminPath;
