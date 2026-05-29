import fs from 'fs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestContext } from '../../../context/request.context';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const GrafanaApp = {
  generateGrafanaToken: () => {
    const { user } = requestContext.require();

    const privateKey = fs.readFileSync(
      path.join(__dirname, '../../../../../../private.pem')
    );

    const token = jwt.sign(
      { sub: user.email, email: user.email, name: 'name', teams: ['XTMHub'] },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '48h',
      }
    );
    return token;
  },
};
