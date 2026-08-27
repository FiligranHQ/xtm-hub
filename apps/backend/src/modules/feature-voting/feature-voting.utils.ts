/**
 * Hosts `next/image` is configured to serve on the frontend, mirroring the
 * `remotePatterns` allow-list of `next.config.mjs`. Validating here as well
 * keeps the public voting page renderable whatever the GraphQL caller is.
 */
const ALLOWED_IMAGE_HOSTS = ['res.cloudinary.com'];

export const isAllowedImageUrl = (value: string): boolean => {
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
