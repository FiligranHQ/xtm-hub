import { dbUnsecure } from '../../../knexfile';
import ActionTracking from '../../model/kanel/public/ActionTracking';

export const getAllActionTracking = (): Promise<ActionTracking[]> => {
  return dbUnsecure<ActionTracking>('ActionTracking');
};

export const addNewActionTracking = (data: ActionTracking) => {
  return dbUnsecure<ActionTracking>('ActionTracking')
    .insert(data);
};
