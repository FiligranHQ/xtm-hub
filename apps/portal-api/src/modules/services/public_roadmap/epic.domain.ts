import { db } from '../../../../knexfile';
import Epic from '../../../model/kanel/public/Epic';

export const EpicDomain = {
  loadEpics: async () => {
    return db<Epic>('Epic').select(['Epic.*']);
  },
};
