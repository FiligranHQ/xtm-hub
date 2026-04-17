import { describe, expect, it, vi } from 'vitest';
import { AppLogsCategory, logApp } from '../../utils/app-logger.util';
import logResolver from './log.resolver';

describe('mutation.frontendErrorLog', () => {
  it('should call logApp.error with the message, stacks and FRONTEND category', () => {
    // Given
    const message = 'Something went wrong in the UI';
    const codeStack = 'Error: ...\n  at Component.render (app.js:42)';
    const componentStack = '\n  in Component\n  in App';
    vi.spyOn(logApp, 'error').mockImplementation(() => undefined);

    // When
    logResolver.Mutation.frontendErrorLog(undefined, {
      message,
      codeStack,
      componentStack,
    });

    // Then
    expect(logApp.error).toHaveBeenCalledWith(
      message,
      { codeStack, componentStack },
      AppLogsCategory.FRONTEND
    );
  });

  it('should call logApp.error exactly once per invocation', () => {
    // Given
    vi.spyOn(logApp, 'error').mockImplementation(() => undefined);

    // When
    logResolver.Mutation.frontendErrorLog(undefined, {
      message: 'err',
      codeStack: null,
      componentStack: null,
    });

    // Then
    expect(logApp.error).toHaveBeenCalledOnce();
  });
});
