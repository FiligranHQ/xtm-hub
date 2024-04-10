import { dbUnsecure } from '../../../knexfile';
import ActionTracking, { ActionTrackingId } from '../../model/kanel/public/ActionTracking';
import { PartialBy } from '../../utils/typescript';

export const getAllActionTracking = (): Promise<ActionTracking[]> => {
  return dbUnsecure<ActionTracking>('ActionTracking');
};

export const addNewActionTracking = (data: PartialBy<ActionTracking, 'status'|'output'>) => {
  return dbUnsecure<ActionTracking>('ActionTracking')
    .insert(data);
};
export const updateActionTracking = (id: ActionTrackingId, data: Partial<ActionTracking>) => {
  return dbUnsecure<ActionTracking>('ActionTracking')
    .where({ id })
    .insert(data);
};
