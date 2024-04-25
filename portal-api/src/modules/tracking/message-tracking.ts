import ActionTracking from '../../model/kanel/public/ActionTracking';
import { dbUnsecure } from '../../../knexfile';
import MessageTracking, { MessageTrackingMutator } from '../../model/kanel/public/MessageTracking';

export const getAllMessageTracking = (): Promise<ActionTracking[]> => {
  return dbUnsecure<MessageTracking>('MessageTracking');
};

export const addNewMessageTracking = (data: MessageTrackingMutator) => {
  return dbUnsecure<MessageTracking>('ActionTracking')
    .insert(data);
};
