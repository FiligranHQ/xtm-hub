import { db } from '../../../../knexfile';
import Epic, { EpicId, EpicMutator } from '../../../model/kanel/public/Epic';

export const EpicDomain = {
  loadEpics: async () => {
    return db<Epic>('Epic').select(['Epic.*']);
  },
  loadEpicsBy: async (field: EpicMutator): Promise<Epic[]> => {
    return db<Epic>('Epic').where(field).select(['Epic.*']);
  },
  createEpic: async (input: Partial<Epic>) => {
    const [createdEpic] = await db<Epic>('Epic').insert(input).returning('*');
    return createdEpic;
  },
  updateEpic: async (id: EpicId, input: EpicMutator) => {
    const [updated] = await db<Epic>('Epic')
      .where({ id })
      .update(input)
      .returning('*');
    return updated;
  },
  deleteEpicBy: async (field: EpicMutator) => {
    await db<Epic>('Epic').where(field).delete();
  },
};
