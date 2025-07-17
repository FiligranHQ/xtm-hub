import { dbUnsecure } from '../../../knexfile';
import ActionTracking, {
  ActionTrackingId,
  ActionTrackingInitializer,
  ActionTrackingMutator,
} from '../../model/kanel/public/ActionTracking';

export const getAllActionTracking = (): Promise<ActionTracking[]> => {
  return dbUnsecure<ActionTracking>('ActionTracking');
};

export const addNewActionTracking = (data: ActionTrackingInitializer) => {
  return dbUnsecure<ActionTracking>('ActionTracking').insert(data);
};
export const updateActionTracking = (
  id: ActionTrackingId,
  data: ActionTrackingMutator
) => {
  return dbUnsecure<ActionTracking>('ActionTracking')
    .where({ id })
    .update(data);
};
