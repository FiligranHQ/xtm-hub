import { useAdminByPass } from '@/hooks/usePortalCapability';
import { usePathname } from 'next/navigation';

const useAdminPath = () => {
  const pathname = usePathname();
  return useAdminByPass() && pathname.includes('admin');
};

export default useAdminPath;
