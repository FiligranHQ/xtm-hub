import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logApp } from './app-logger.util';
import {
  resolveSessionReferer,
  toSafeRedirectPath,
} from './extract-referer.util';

describe('toSafeRedirectPath', () => {
  beforeEach(() => {
    vi.spyOn(logApp, 'warn').mockImplementation(() => {});
  });

  describe('relative paths', () => {
    it('returns a valid relative path unchanged', () => {
      expect(toSafeRedirectPath('/app/manage/user')).toBe('/app/manage/user');
    });

    it('returns the root path', () => {
      expect(toSafeRedirectPath('/')).toBe('/');
    });

    it('returns a nested path with query string unchanged', () => {
      expect(
        toSafeRedirectPath('/app/service/opencti_custom_dashboards/abc-123')
      ).toBe('/app/service/opencti_custom_dashboards/abc-123');
    });

    it('rejects a protocol-relative URL and warns', () => {
      expect(toSafeRedirectPath('//evil.com')).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalledWith(
        'Unsafe redirect path rejected (CWE-601)',
        { url: '//evil.com' }
      );
    });

    it('rejects a plain string with no leading slash and warns', () => {
      expect(toSafeRedirectPath('evil.com/path')).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalled();
    });
  });

  describe('absolute URLs', () => {
    it('rejects a same-origin absolute URL and warns', () => {
      expect(
        toSafeRedirectPath('https://localhost:3002/app/manage/user')
      ).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalledWith(
        'Non-relative URL in redirect param rejected (CWE-601)',
        { url: 'https://localhost:3002/app/manage/user' }
      );
    });

    it('rejects a cross-origin absolute URL and warns', () => {
      expect(toSafeRedirectPath('https://evil.com/path')).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalledWith(
        'Non-relative URL in redirect param rejected (CWE-601)',
        { url: 'https://evil.com/path' }
      );
    });

    it('rejects an absolute URL with no pathname and warns', () => {
      expect(toSafeRedirectPath('https://evil.com')).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalledWith(
        'Non-relative URL in redirect param rejected (CWE-601)',
        { url: 'https://evil.com' }
      );
    });

    it('rejects javascript: scheme and warns', () => {
      expect(toSafeRedirectPath('javascript:alert(1)')).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalledWith(
        'Non-relative URL in redirect param rejected (CWE-601)',
        { url: 'javascript:alert(1)' }
      );
    });

    it('rejects data: scheme and warns', () => {
      expect(
        toSafeRedirectPath('data:text/html,<script>alert(1)</script>')
      ).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalled();
    });
  });

  describe('parser-differential payloads', () => {
    it.each`
      url                   | description
      ${'/\\evil.com'}      | ${'backslash normalised to a slash by the URL parser'}
      ${'/\\\\evil.com'}    | ${'double backslash'}
      ${'\\\\evil.com'}     | ${'leading double backslash'}
      ${'/\\evil.com/path'} | ${'backslash with a trailing path'}
    `('rejects $description', ({ url }) => {
      expect(toSafeRedirectPath(url)).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalled();
    });
  });

  describe('control characters', () => {
    it.each`
      url                          | description
      ${'/app\r\nSet-Cookie: a=b'} | ${'CRLF response splitting'}
      ${'/app\u0000'}              | ${'NUL byte'}
      ${'/app\tx'}                 | ${'tab'}
      ${'/app\u007F'}              | ${'DEL'}
    `('rejects $description', ({ url }) => {
      expect(toSafeRedirectPath(url)).toBeUndefined();
      expect(logApp.warn).toHaveBeenCalled();
    });
  });

  describe('logging', () => {
    it('truncates oversized values before logging them', () => {
      const url = `https://evil.com/${'a'.repeat(1000)}`;
      toSafeRedirectPath(url);
      const [, meta] = vi.mocked(logApp.warn).mock.calls[0] as [
        string,
        { url: string },
      ];
      expect(meta.url).toHaveLength(256);
    });
  });

  describe('edge cases', () => {
    it('does not warn for valid relative paths', () => {
      toSafeRedirectPath('/app/manage/user');
      expect(logApp.warn).not.toHaveBeenCalled();
    });

    it('does warn for absolute URLs', () => {
      toSafeRedirectPath('https://localhost:3002/app');
      expect(logApp.warn).toHaveBeenCalledWith(
        'Non-relative URL in redirect param rejected (CWE-601)',
        { url: 'https://localhost:3002/app' }
      );
    });
  });
});

describe('resolveSessionReferer', () => {
  beforeEach(() => {
    vi.spyOn(logApp, 'warn').mockImplementation(() => {});
    vi.spyOn(logApp, 'error').mockImplementation(() => {});
  });

  it('returns undefined for empty string', () => {
    expect(resolveSessionReferer('')).toBeUndefined();
    expect(logApp.warn).not.toHaveBeenCalled();
    expect(logApp.error).not.toHaveBeenCalled();
  });

  it('returns a safe relative path from a valid base64 value', () => {
    expect(resolveSessionReferer(btoa('/app/manage/user'))).toBe(
      '/app/manage/user'
    );
    expect(logApp.warn).not.toHaveBeenCalled();
    expect(logApp.error).not.toHaveBeenCalled();
  });

  it('rejects a base64-encoded absolute URL and warns', () => {
    expect(
      resolveSessionReferer(btoa('https://evil.com/path'))
    ).toBeUndefined();
    expect(logApp.warn).toHaveBeenCalledWith(
      'Non-relative URL in redirect param rejected (CWE-601)',
      { url: 'https://evil.com/path' }
    );
    expect(logApp.error).not.toHaveBeenCalled();
  });

  it('rejects a base64-encoded absolute URL with no pathname and warns', () => {
    expect(resolveSessionReferer(btoa('https://evil.com'))).toBeUndefined();
    expect(logApp.warn).toHaveBeenCalledWith(
      'Non-relative URL in redirect param rejected (CWE-601)',
      { url: 'https://evil.com' }
    );
    expect(logApp.error).not.toHaveBeenCalled();
  });

  it('returns undefined and warns for a base64-encoded protocol-relative URL', () => {
    expect(resolveSessionReferer(btoa('//evil.com'))).toBeUndefined();
    expect(logApp.warn).toHaveBeenCalledWith(
      'Unsafe redirect path rejected (CWE-601)',
      { url: '//evil.com' }
    );
  });

  it('returns undefined and warns for a base64-encoded javascript: URL', () => {
    expect(resolveSessionReferer(btoa('javascript:alert(1)'))).toBeUndefined();
    expect(logApp.warn).toHaveBeenCalledWith(
      'Non-relative URL in redirect param rejected (CWE-601)',
      { url: 'javascript:alert(1)' }
    );
  });

  it('returns undefined and logs an error for malformed base64', () => {
    expect(resolveSessionReferer('not!!!valid-base64')).toBeUndefined();
    expect(logApp.error).toHaveBeenCalledWith(
      'Malformed base64 redirect param in auth request',
      { redirect: 'not!!!valid-base64' }
    );
    expect(logApp.warn).not.toHaveBeenCalled();
  });
});
