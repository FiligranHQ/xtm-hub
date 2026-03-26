import cors from 'cors';
import { Express } from 'express';
import { Readable } from 'stream';
import { db } from '../../../knexfile';
import User from '../../model/kanel/public/User';
import { MinIOClient } from '../../thirdparty/minio/client';
import { logApp } from '../../utils/app-logger.util';
import rateLimit from 'express-rate-limit';

const userPictureRateLimiter = rateLimit({
  windowMs: 180 * 1000, // 3 minutes
  max: 10, // max 10 request per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
});

export const userPictureEndpoint = (app: Express) => {
  app.get('/user/picture/:userId', userPictureRateLimiter, cors(), async (req, res) => {
    try {
      const [user] = await db<User>('User')
        .where('id', req.params.userId)
        .select('picture_minio');

      if (!user?.picture_minio) {
        return res.status(404).json({ message: 'No picture found' });
      }

      const stream = (await MinIOClient.downloadFile(
        user.picture_minio
      )) as Readable;

      stream.pipe(res);
    } catch (error) {
      logApp.error('Error while retrieving user picture', { error });
      res.status(404).json({ message: 'Picture not found' });
    }
  });
};