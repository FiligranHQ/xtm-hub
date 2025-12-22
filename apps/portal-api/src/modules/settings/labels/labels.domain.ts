import { db, paginate } from '../../../../knexfile';
import {
  LabelConnection,
  QueryLabelsArgs,
} from '../../../__generated__/resolvers-types';
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

  loadLabels: (opts: Partial<QueryLabelsArgs>): Promise<LabelConnection> => {
    const labelQuery = db<Label>('Label').modify((queryBuilder) => {
      if (opts.documentType) {
        queryBuilder
          .distinct('Label.*')
          .innerJoin('Object_Label', 'Label.id', 'Object_Label.label_id')
          .innerJoin('Document', 'Document.id', 'Object_Label.object_id')
          .where('Document.type', opts.documentType);
      }
    });
    return paginate<Label, LabelConnection>(
      'Label',
      opts,
      undefined,
      labelQuery
    );
  },

  loadLabelsByDocumentId: (documentId: string): Promise<Label[]> => {
    return db<Label>('Label')
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
