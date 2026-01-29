import { db } from '../../../../knexfile';
import ObjectUseCase, {
  ObjectUseCaseInitializer,
  ObjectUseCaseMutator,
} from '../../../model/kanel/public/ObjectUseCase';

export const objectUseCaseDomain = {
  insertObjectUseCase: async (
    initializer: ObjectUseCaseInitializer | ObjectUseCaseInitializer[]
  ) => {
    await db<ObjectUseCase>('Object_UseCase').insert(initializer);
  },

  deleteObjectUseCaseBy: async (field: ObjectUseCaseMutator): Promise<void> => {
    await db<ObjectUseCase>('Object_UseCase').where(field).delete('*');
  },
};
