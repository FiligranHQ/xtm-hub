import { useCallback } from 'react';
import { useSessionStorage } from 'usehooks-ts';

type ScrollContainer = 'main' | 'window';

interface ScrollPositionValue {
  container: ScrollContainer;
  position: number;
}

const SCROLL_POSITION_KEY = 'scrollPosition';
const DEFAULT_SCROLL_POSITION: ScrollPositionValue = {
  container: 'main',
  position: 0,
};

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] =
    useSessionStorage<ScrollPositionValue>(
      SCROLL_POSITION_KEY,
      DEFAULT_SCROLL_POSITION
    );

  const restore = useCallback(() => {
    if (scrollPosition.position == null) return;
    if (scrollPosition.container === 'main') {
      const el = window.document.querySelector('main');
      if (!el) return;
      el.scrollTo({ top: scrollPosition.position, behavior: 'auto' });
    } else {
      window.scrollTo({ top: scrollPosition.position, behavior: 'auto' });
    }
  }, [scrollPosition]);

  const save = useCallback(() => {
    const mainEl = window.document.querySelector('main');
    const mainScrollTop = mainEl?.scrollTop ?? 0;
    const activeContainer: ScrollContainer =
      mainScrollTop > 0 ? 'main' : 'window';
    const position =
      activeContainer === 'main' ? mainScrollTop : window.scrollY;
    setScrollPosition({ container: activeContainer, position });
  }, [setScrollPosition]);

  const reset = useCallback(() => {
    setScrollPosition(DEFAULT_SCROLL_POSITION);
  }, [setScrollPosition]);

  return { restore, save, reset };
};

export default useScrollPosition;
