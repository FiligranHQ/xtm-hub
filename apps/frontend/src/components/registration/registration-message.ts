import { PlatformIdentifier } from '@graphql/generated';

/**
 * Platforms whose registration page posts its messages to the platform's own
 * origin, with the `state` the platform opened it with, and never registers
 * again without an explicit confirmation. OpenCTI and OpenAEV keep posting to
 * any opener ('*'): an instance whose declared URL differs from the origin
 * its admins browse would stop receiving its token.
 */
const TARGETED_IDENTIFIERS = new Set<PlatformIdentifier>([
  PlatformIdentifier.Xtmone,
]);

export const isTargetedRegistration = (
  identifier?: PlatformIdentifier
): boolean => !!identifier && TARGETED_IDENTIFIERS.has(identifier);

/**
 * Where a registration message may be posted: '*' for the legacy platforms,
 * the origin of the platform URL for the others, `null` when that URL is not
 * an http(s) URL (nothing is posted then).
 */
export const registrationMessageTarget = (
  identifier: PlatformIdentifier | undefined,
  platformUrl: string
): string | null => {
  if (!isTargetedRegistration(identifier)) {
    return '*';
  }
  try {
    const url = new URL(platformUrl);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.origin
      : null;
  } catch {
    return null;
  }
};

export type RegistrationMessage =
  | { action: 'register'; token: string }
  | { action: 'unregister' }
  | { action: 'cancel' };

export const buildRegistrationMessage = (
  identifier: PlatformIdentifier | undefined,
  message: RegistrationMessage,
  state?: string
): RegistrationMessage & { state?: string } =>
  isTargetedRegistration(identifier) && state ? { ...message, state } : message;

/**
 * Post *message* to the window that opened this page; whether one received
 * it (no opener, or no allowed target, means the platform did not).
 */
export const postRegistrationMessage = (
  opener: Pick<Window, 'postMessage'> | null | undefined,
  identifier: PlatformIdentifier | undefined,
  platformUrl: string,
  message: RegistrationMessage,
  state?: string
): boolean => {
  const target = registrationMessageTarget(identifier, platformUrl);
  if (!opener || !target) {
    return false;
  }
  opener.postMessage(
    buildRegistrationMessage(identifier, message, state),
    target
  );
  return true;
};
