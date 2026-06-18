import { db, paginate } from '../../../knexfile';
import {
  EpicConnection,
  EpicCountPerTimeline,
  QueryEpicsArgs,
  Timeline,
} from '../../__generated__/resolvers-types';
import Epic, { EpicId, EpicMutator } from '../../model/kanel/public/Epic';
import { UnknownErrorCode } from '../../utils/error/error.code';

export const EpicDomain = {
  loadEpics: async (opts: Partial<QueryEpicsArgs>) => {
    const epicQuery = db<Epic>('Epic').select(['Epic.*']);
    return paginate<Epic, EpicConnection>('Epic', opts, undefined, epicQuery);
  },
  loadEpicsBy: async (field: EpicMutator): Promise<Epic[]> => {
    return db<Epic>('Epic').where(field).select(['Epic.*']);
  },
  createEpic: async (input: Partial<Epic>): Promise<Epic> => {
    const [createdEpic] = await db<Epic>('Epic').insert(input).returning('*');
    if (!createdEpic) {
      throw new Error(UnknownErrorCode.EpicCreateError);
    }
    return createdEpic;
  },
  updateEpic: async (id: EpicId, input: EpicMutator): Promise<Epic> => {
    const [updated] = await db<Epic>('Epic')
      .where({ id })
      .update(input)
      .returning('*');
    if (!updated) {
      throw new Error(UnknownErrorCode.EpicUpdateError);
    }
    return updated;
  },
  deleteEpicBy: async (field: EpicMutator) => {
    await db<Epic>('Epic').where(field).delete();
  },
  countEpicsPerTimeline: async (): Promise<EpicCountPerTimeline[]> => {
    const rows = await db<Epic>('Epic')
      .whereNot({ timeline: Timeline.Finished })
      .groupBy('timeline')
      .select('timeline')
      .count({ count: '*' });
    return rows.map((row: { timeline: string; count: string | number }) => ({
      timeline: row.timeline as Timeline,
      count: Number(row.count),
    }));
  },
};
