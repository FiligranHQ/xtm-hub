import ActionTracking from './kanel/public/ActionTracking';
import MessageTracking from './kanel/public/MessageTracking';

export interface TrackingData extends ActionTracking {
    message_tracking: MessageTracking;
}
