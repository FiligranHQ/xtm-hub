import useGranted from '@/hooks/useGranted';
import { RESTRICTION } from '@/utils/constant';
import { usePathname } from 'next/navigation';

const useAdminPath = () => {
  const pathname = usePathname();
  return (
    useGranted(RESTRICTION.CAPABILITY_BYPASS) && pathname.includes('admin')
  );
};

export default useAdminPath;
