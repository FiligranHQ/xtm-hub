import { CookieConsentBanner } from '@/components/cookie-consent/CookieConsentBanner';
import { CookieConsentProvider } from '@/components/cookie-consent/CookieConsentProvider';
import testRender from '@/utils/test/test-render';
import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const BANNER_HEIGHT_VAR = '--cookie-banner-height';
const BANNER_HEIGHT = 145;
const RESIZED_BANNER_HEIGHT = 212;

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];
  readonly targets = new Set<Element>();

  constructor(private readonly callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  notify() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

const readBannerHeightVar = () =>
  document.documentElement.style.getPropertyValue(BANNER_HEIGHT_VAR);

const renderBanner = () =>
  testRender(
    <CookieConsentProvider initialConsent={null}>
      <CookieConsentBanner />
    </CookieConsentProvider>
  );

// jsdom has no layout: the banner reports the height a browser would measure, then the observer fires.
const resizeBanner = (height: number) => {
  const banner = screen.getByRole('region');
  Object.defineProperty(banner, 'offsetHeight', {
    configurable: true,
    value: height,
  });
  act(() => {
    ResizeObserverMock.instances
      .filter((observer) => observer.targets.has(banner))
      .forEach((observer) => observer.notify());
  });
};

describe('CookieConsentBanner', () => {
  const globalResizeObserver = globalThis.ResizeObserver;

  // The global stub is writable but not configurable, so vi.stubGlobal cannot redefine it.
  beforeEach(() => {
    ResizeObserverMock.instances = [];
    globalThis.ResizeObserver = ResizeObserverMock;
  });

  afterEach(() => {
    globalThis.ResizeObserver = globalResizeObserver;
    document.documentElement.style.removeProperty(BANNER_HEIGHT_VAR);
    document.cookie.split('; ').forEach((entry) => {
      document.cookie = `${entry.split('=')[0]}=; path=/; max-age=0`;
    });
  });

  it('should publish the banner height on the document root when the banner shows', () => {
    // Given
    renderBanner();

    // When
    resizeBanner(BANNER_HEIGHT);

    // Then
    expect(readBannerHeightVar()).toBe(`${BANNER_HEIGHT}px`);
  });

  it('should follow the banner height when the banner is resized', () => {
    // Given
    renderBanner();
    resizeBanner(BANNER_HEIGHT);

    // When
    resizeBanner(RESIZED_BANNER_HEIGHT);

    // Then
    expect(readBannerHeightVar()).toBe(`${RESIZED_BANNER_HEIGHT}px`);
  });

  it('should remove the banner height when the visitor answers', async () => {
    // Given
    const { user } = renderBanner();
    resizeBanner(BANNER_HEIGHT);

    // When
    await user.click(screen.getByRole('button', { name: 'AcceptAll' }));

    // Then
    expect(readBannerHeightVar()).toBe('');
  });

  it('should remove the banner height when the banner unmounts', () => {
    // Given
    const { unmount } = renderBanner();
    resizeBanner(BANNER_HEIGHT);

    // When
    unmount();

    // Then
    expect(readBannerHeightVar()).toBe('');
  });
});
