import { db, paginate } from '../../../../knexfile';
import {
  EpicConnection,
  QueryEpicsArgs,
} from '../../../__generated__/resolvers-types';
import Epic, { EpicId, EpicMutator } from '../../../model/kanel/public/Epic';

export const EpicDomain = {
  loadEpics: async (opts: Partial<QueryEpicsArgs>) => {
    const epicQuery = db<Epic>('Epic').select(['Epic.*']);
    return paginate<Epic, EpicConnection>('Epic', opts, undefined, epicQuery);
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
