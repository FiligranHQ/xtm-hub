import { useWindowSize } from 'usehooks-ts';

const MOBILE_SIZE = 640;
const useIsMobile = (): boolean => {
  const { width = 0, height = 0 } = useWindowSize();
  return width < MOBILE_SIZE;
};

export default useIsMobile;
