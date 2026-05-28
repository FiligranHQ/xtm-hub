import crypto from 'node:crypto';

export const validatePassword = (salt, tentativePassword, realPassword) => {
  const hash = crypto
    .pbkdf2Sync(tentativePassword, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return realPassword === hash;
};
