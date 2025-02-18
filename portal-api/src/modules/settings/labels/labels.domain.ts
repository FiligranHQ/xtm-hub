import { db, paginate } from '../../../../knexfile';
import { LabelConnection } from '../../../__generated__/resolvers-types';
import Label, { LabelMutator } from '../../../model/kanel/public/Label';
import ObjectLabel from '../../../model/kanel/public/ObjectLabel';

export const loadLabels = async (context, opts) =>
  paginate<Label, LabelConnection>(context, 'Label', opts);

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
  await db<ObjectLabel>(context, 'Object_Label')
    .where({ label_id: label.id })
    .delete('*');
  await db<Label>(context, 'Label').where(field).delete('*');
  return label;
};
