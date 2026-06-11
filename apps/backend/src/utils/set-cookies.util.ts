import { Response } from 'express';

export const setCookieError = (res: Response, message?: string) => {
  res.cookie('opencti_flash', message || 'Unknown error', {
    maxAge: 5000,
    httpOnly: false,
    secure: true,
    sameSite: 'strict',
  });
};
