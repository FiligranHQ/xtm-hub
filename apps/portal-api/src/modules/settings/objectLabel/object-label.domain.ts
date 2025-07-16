import { db } from '../../../../knexfile';
import ObjectLabel from '../../../model/kanel/public/ObjectLabel';

export const addObjectLabel = async (context, input, trx) => {
  const objectLabels = await db<ObjectLabel>(context, 'Object_Label')
    .insert(input)
    .transacting(trx);
  return objectLabels;
};
