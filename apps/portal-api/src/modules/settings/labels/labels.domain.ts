import { db, paginate } from '../../../../knexfile';
import { LabelConnection } from '../../../__generated__/resolvers-types';
import Label, { LabelMutator } from '../../../model/kanel/public/Label';
import ObjectLabel from '../../../model/kanel/public/ObjectLabel';
import { PortalContext } from '../../../model/portal-context';

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

export const getOrCreateLabel = async ({
  context,
  name,
  color = '#0099cc',
}: {
  context: PortalContext;
  name: string;
  color?: string;
}): Promise<Label> => {
  const existing = await db(context, 'Label')
    .where('name', 'ILIKE', name)
    .select('*')
    .first();

  if (existing) {
    return existing;
  }

  const newLabel = await db<Label>(context, 'Label')
    .insert({
      name,
      color,
    })
    .returning('*');
  return newLabel[0];
};
