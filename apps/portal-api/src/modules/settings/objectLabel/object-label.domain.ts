import { db } from '../../../../knexfile';
import ObjectLabel, {
  ObjectLabelInitializer,
  ObjectLabelMutator,
} from '../../../model/kanel/public/ObjectLabel';

export const objectLabelDomain = {
  insertObjectLabel: async (
    initializer: ObjectLabelInitializer | ObjectLabelInitializer[]
  ) => {
    await db<ObjectLabel>('Object_Label').insert(initializer);
  },

  deleteObjectLabelBy: async (field: ObjectLabelMutator): Promise<void> => {
    await db<ObjectLabel>('Object_Label').where(field).delete('*');
  },
};
