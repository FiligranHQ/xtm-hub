import { DEBOUNCE_TIME } from '@/utils/constant';
import { useDebounceCallback } from 'usehooks-ts';

export const debounceHandleInput = (callback: (v: never) => void) =>
  useDebounceCallback((e) => callback(e.target.value as never), DEBOUNCE_TIME);
