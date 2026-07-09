import { db } from '../../../knexfile';
import OneClickDeployment, {
  OneClickDeploymentInitializer,
} from '../../model/kanel/public/OneClickDeployment';

export const OneClickDeploymentDomain = {
  insert: async (init: OneClickDeploymentInitializer): Promise<void> => {
    await db<OneClickDeployment>('OneClickDeployment').insert(init);
  },
};
