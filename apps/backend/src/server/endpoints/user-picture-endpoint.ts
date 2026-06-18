import cors from 'cors';
import { Express, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { Readable } from 'stream';
import { db } from '../../../knexfile';
import User from '../../model/kanel/public/User';
import { MinIOClient } from '../../thirdparty/minio/client';
import { logApp } from '../../utils/app-logger.util';

const USER_PICTURE_RATE_WINDOW_MS = 60 * 1000;
const USER_PICTURE_RATE_MAX = 300;
const USER_PICTURE_CACHE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const userPictureRateLimiter = rateLimit({
  windowMs: USER_PICTURE_RATE_WINDOW_MS,
  max: USER_PICTURE_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

export const getUserPicture = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const [user] = await db<User>('User')
      .where('id', req.params.userId)
      .select('picture_minio');

    if (!user?.picture_minio) {
      res.status(404).json({ message: 'No picture found' });
      return;
    }

    const body = await MinIOClient.downloadFile(user.picture_minio);

    if (!body) {
      res.status(404).json({ message: 'Picture not found' });
      return;
    }

    const stream = body as Readable;

    res.setHeader(
      'Cache-Control',
      `public, max-age=${USER_PICTURE_CACHE_MAX_AGE_SECONDS}, immutable`
    );

    stream.on('error', (error) => {
      logApp.error('Error while streaming user picture', { error });
      if (res.headersSent) {
        res.destroy(error);
      } else {
        res.removeHeader('Cache-Control');
        res.status(404).json({ message: 'Picture not found' });
      }
    });

    stream.pipe(res);
  } catch (error) {
    logApp.error('Error while retrieving user picture', { error });
    if (res.headersSent) {
      res.destroy(error as Error);
      return;
    }
    res.removeHeader('Cache-Control');
    res.status(404).json({ message: 'Picture not found' });
  }
};

export const userPictureEndpoint = (app: Express) => {
  app.get(
    '/user/picture/:userId',
    userPictureRateLimiter,
    cors(),
    getUserPicture
  );
};
