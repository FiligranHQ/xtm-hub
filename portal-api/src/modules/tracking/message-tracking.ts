import ActionTracking from '../../model/kanel/public/ActionTracking';
import { dbUnsecure } from '../../../knexfile';
import MessageTracking, {
  MessageTrackingId,
  MessageTrackingInitializer,
} from '../../model/kanel/public/MessageTracking';
import { v4 as uuidv4 } from 'uuid';

export const getAllMessageTracking = (): Promise<ActionTracking[]> => {
  return dbUnsecure<MessageTracking>('MessageTracking');
};

export const addNewMessageTracking = (data: MessageTrackingInitializer) => {
  return dbUnsecure<MessageTracking>('MessageTracking')
    .insert({
      ...data,
      id: uuidv4() as MessageTrackingId,
    });
};
