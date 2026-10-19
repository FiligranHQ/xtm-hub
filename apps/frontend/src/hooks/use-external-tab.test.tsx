import useExternalTab from '@/hooks/use-external-tab';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const TAB_ORIGIN = 'https://opencti.example.com';
const TAB_URL = `${TAB_ORIGIN}/dashboard/xtm-hub/deploy/instance-id/document-id`;
const OTHER_ORIGIN = 'https://other.example.com';
const TAB_NAME = 'opencti-one-click-deploy';
const MESSAGE = { action: 'set-token', token: 'a-token' };

const createWindow = (): Window => {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  return iframe.contentWindow as Window;
};

const dispatchMessage = (
  source: Window,
  origin: string,
  data: Record<string, unknown> = MESSAGE
) => {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, origin, source }));
  });
};

const renderExternalTab = (
  url: string,
  onMessage: (event: MessageEvent) => void = vi.fn()
) => {
  const { result } = renderHook(() =>
    useExternalTab({ url, tabName: TAB_NAME, onMessage, preventUnload: false })
  );
  act(() => {
    result.current.openTab();
  });
  return result;
};

describe('useExternalTab', () => {
  let tab: Window;

  beforeEach(() => {
    vi.useFakeTimers();
    tab = createWindow();
    vi.spyOn(window, 'open').mockReturnValue(tab);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('should post the message to the origin of the opened url when posting to the tab', () => {
    // Given
    const tabPostMessage = vi
      .spyOn(tab, 'postMessage')
      .mockImplementation(() => undefined);
    const result = renderExternalTab(TAB_URL);

    // When
    result.current.postMessage(MESSAGE);

    // Then
    expect(tabPostMessage).toHaveBeenCalledWith(MESSAGE, TAB_ORIGIN);
  });

  it('should not post the message when the opened url has no valid origin', () => {
    // Given
    const tabPostMessage = vi
      .spyOn(tab, 'postMessage')
      .mockImplementation(() => undefined);
    const result = renderExternalTab('/dashboard/xtm-hub');

    // When
    result.current.postMessage(MESSAGE);

    // Then
    expect(tabPostMessage).not.toHaveBeenCalled();
  });

  it('should call onMessage when the message comes from the tab with the opened url origin', () => {
    // Given
    const onMessage = vi.fn();
    renderExternalTab(TAB_URL, onMessage);

    // When
    dispatchMessage(tab, TAB_ORIGIN);

    // Then
    expect(onMessage).toHaveBeenCalledWith(
      expect.objectContaining({ data: MESSAGE, origin: TAB_ORIGIN })
    );
  });

  it('should log and ignore the message when it comes from the tab with another origin', () => {
    // Given
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onMessage = vi.fn();
    renderExternalTab(TAB_URL, onMessage);

    // When
    dispatchMessage(tab, OTHER_ORIGIN);

    // Then
    expect(onMessage).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(`"${OTHER_ORIGIN}"`)
    );
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining(MESSAGE.token)
    );
  });

  it('should silently ignore a message without action from the tab with another origin', () => {
    // Given
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const onMessage = vi.fn();
    renderExternalTab(TAB_URL, onMessage);

    // When
    dispatchMessage(tab, OTHER_ORIGIN, { type: 'analytics' });

    // Then
    expect(onMessage).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('should ignore the message when it comes from another window with the opened url origin', () => {
    // Given
    const onMessage = vi.fn();
    const otherWindow = createWindow();
    renderExternalTab(TAB_URL, onMessage);

    // When
    dispatchMessage(otherWindow, TAB_ORIGIN);

    // Then
    expect(onMessage).not.toHaveBeenCalled();
  });
});
