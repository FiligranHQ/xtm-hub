/**
 * Hosts `next/image` is configured to serve, mirroring the `remotePatterns`
 * allow-list of `next.config.mjs`. Anything else is refused so the public
 * voting page cannot be broken by an admin typo.
 */
const ALLOWED_IMAGE_HOSTS = ['res.cloudinary.com'];

export const isAllowedImageUrl = (value: string): boolean => {
  // A local path is served by Next itself and needs no allow-list.
  if (value.startsWith('/')) {
    return true;
  }

  try {
    const { protocol, hostname } = new URL(value);
    return protocol === 'https:' && ALLOWED_IMAGE_HOSTS.includes(hostname);
  } catch {
    return false;
  }
};
