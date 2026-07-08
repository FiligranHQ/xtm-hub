import { db } from '../../../knexfile';
import OneClickDeployment, {
  OneClickDeploymentInitializer,
} from '../../model/kanel/public/OneClickDeployment';

export const OneClickDeploymentDomain = {
  insert: async (init: OneClickDeploymentInitializer): Promise<void> => {
    await db<OneClickDeployment>('OneClickDeployment')
      .insert(init)
      .onConflict('source_event_id')
      .ignore();
  },

  insertMany: async (inits: OneClickDeploymentInitializer[]): Promise<void> => {
    if (inits.length === 0) {
      return;
    }
    await db<OneClickDeployment>('OneClickDeployment')
      .insert(inits)
      .onConflict('source_event_id')
      .ignore();
  },
};
