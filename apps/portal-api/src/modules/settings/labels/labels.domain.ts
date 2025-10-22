import { db, paginate, QueryOpts } from '../../../../knexfile';
import { LabelConnection } from '../../../__generated__/resolvers-types';
import Label, {
  LabelId,
  LabelInitializer,
  LabelMutator,
} from '../../../model/kanel/public/Label';

export const labelsDomain = {
  insertLabel: async (input: LabelInitializer): Promise<Label> => {
    const [label] = await db<Label>('Label').insert(input).returning('*');
    return label;
  },

  updateLabel: async (id: LabelId, fields: LabelMutator): Promise<Label> => {
    const [label] = await db<Label>('Label')
      .where({ id })
      .update(fields)
      .returning('*');
    return label;
  },

  loadLabels: (opts: Partial<QueryOpts>): Promise<LabelConnection> => {
    return paginate<Label, LabelConnection>('Label', opts);
  },

  loadLabelsByDocumentId: (
    documentId: string,
    opts: Partial<QueryOpts> = {}
  ): Promise<Label[]> => {
    return db<Label>('Label', opts)
      .leftJoin('Object_Label as ol', 'ol.label_id', 'Label.id')
      .where('ol.object_id', '=', documentId)
      .returning('Label.*');
  },

  loadLabelBy: (field: LabelMutator): Promise<Label | null> => {
    return db<Label>('Label').where(field).first();
  },

  loadLabelByLikeName: (name: string): Promise<Label | null> => {
    return db('Label').where('name', 'ILIKE', name).select('*').first();
  },

  deleteLabel: async (field: LabelMutator): Promise<Label> => {
    const [deletedLabel] = await db<Label>('Label').where(field).delete('*');

    return deletedLabel;
  },
};
