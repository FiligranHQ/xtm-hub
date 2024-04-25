import ActionTracking from '../../model/kanel/public/ActionTracking';
import { dbUnsecure } from '../../../knexfile';
import MessageTracking, { MessageTrackingInitializer } from '../../model/kanel/public/MessageTracking';

export const getAllMessageTracking = (): Promise<ActionTracking[]> => {
  return dbUnsecure<MessageTracking>('MessageTracking');
};

export const addNewMessageTracking = (data: MessageTrackingInitializer) => {
  return dbUnsecure<MessageTracking>('MessageTracking')
    .insert(data);
};
