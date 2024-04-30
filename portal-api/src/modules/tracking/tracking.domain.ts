import { AWXWorkflowAction } from '../../managers/awx/awx.model';
import { v4 as uuidv4 } from 'uuid';
import ActionTracking, { ActionTrackingId } from '../../model/kanel/public/ActionTracking';
import { addNewActionTracking, updateActionTracking } from './action-tracking';
import { addNewMessageTracking } from './message-tracking';
import { TrackingConst } from './tracking.const';
import { MessageTrackingInitializer } from '../../model/kanel/public/MessageTracking';
import { PortalContext } from '../../model/portal-context';
import { db, dbRaw } from '../../../knexfile';

export const initTracking = async (action: AWXWorkflowAction) => {
    const id = uuidv4() as ActionTrackingId;
    const created_at = new Date();
    await addNewActionTracking({
        id,
        created_at,
        contextual_id: action.input.id,
    });
    await addNewMessageTracking({
        tracking_id: id,
        created_at,
        type: action.type,
        technical: false,
    });
    return id;
};

export const endTracking = async (awxId: ActionTrackingId, output?: unknown) => {
    const ended_at = new Date();
    await updateActionTracking(awxId, {
        status: 'FINISHED',
        ended_at,
    });
    const messageTrackingData: MessageTrackingInitializer = {
        ...TrackingConst.END_PROCESS,
        tracking_id: awxId,
        created_at: ended_at,
    };

    if (output) {
        messageTrackingData.tracking_info = output;
    }

    await addNewMessageTracking(messageTrackingData);

};

export const loadTrackingDataBy = (context: PortalContext, field: string, value: string) => {
    return db<ActionTracking>(context, 'ActionTracking')
        .select(['ActionTracking.*',
            dbRaw('json_agg("MessageTracking".*) AS message_tracking')])
        .leftJoin('MessageTracking', 'MessageTracking.tracking_id', '=', 'ActionTracking.id')
        .where({ [field]: value })
        .groupBy('ActionTracking.id');
};

