import { ANIMATION_TIME } from '@/utils/constant';

export const useExecuteAfterAnimation = (callback: () => void) => {
  setTimeout(callback, ANIMATION_TIME);
};
