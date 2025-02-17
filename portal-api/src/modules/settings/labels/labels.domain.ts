import { db, paginate } from '../../../../knexfile';
import { LabelConnection } from '../../../__generated__/resolvers-types';
import DocumentLabel from '../../../model/kanel/public/DocumentLabel';
import Label, { LabelMutator } from '../../../model/kanel/public/Label';

export const loadLabels = async (context, opts) => {
  const labelConnection = await paginate<Label>(
    context,
    'Label',
    opts
  ).asConnection<LabelConnection>();

  const { totalCount } = await db<Label>(context, 'Label')
    .countDistinct('Label.id as totalCount')
    .first();

  return {
    totalCount,
    ...labelConnection,
  };
};
export const loadLabel = (context, id) =>
  db<Label>(context, 'Label').where({ id }).first();

export const addLabel = async (context, input) => {
  const [label] = await db<Label>(context, 'Label')
    .insert(input)
    .returning('*');
  return label;
};

export const editLabel = async (context, { id, input }) => {
  const [label] = await db<Label>(context, 'Label')
    .where({ id })
    .update(input)
    .returning('*');
  return label;
};

export const deleteLabelBy = async (context, field: LabelMutator) => {
  const [label] = await db<Label>(context, 'Label').where(field).returning('*');
  await db<DocumentLabel>(context, 'Object_Label')
    .where({ label_id: label.id })
    .delete('*');
  await db<Label>(context, 'Label').where(field).delete('*');
  return label;
};
