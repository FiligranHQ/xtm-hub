import { v4 as uuidv4 } from 'uuid';
import { db, dbRaw, dbUnsecure } from '../../../knexfile';
import { AWXWorkflowAction } from '../../managers/awx/awx.model';
import ActionTracking, {
  ActionTrackingId,
} from '../../model/kanel/public/ActionTracking';
import { MessageTrackingInitializer } from '../../model/kanel/public/MessageTracking';
import { PortalContext } from '../../model/portal-context';
import { addNewActionTracking, updateActionTracking } from './action-tracking';
import { addNewMessageTracking } from './message-tracking';
import { TrackingConst } from './tracking.const';

export const initTracking = async (action: AWXWorkflowAction) => {
  const id = uuidv4() as ActionTrackingId;
  const created_at = new Date();

  await addNewActionTracking({
    id,
    created_at,
    status: 'IN_PROGRESS',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    contextual_id: action.input.id,
    type: action.type,
  });
  await addNewMessageTracking({
    tracking_id: id,
    created_at,
    type: action.type,
    technical: false,
  });
  return id;
};

export const endTracking = async (
  awxId: ActionTrackingId,
  status: string,
  output?: unknown
) => {
  const ended_at = new Date();
  await updateActionTracking(awxId, {
    status,
    ended_at,
  });
  const messageTrackingData: MessageTrackingInitializer = {
    ...TrackingConst.END_AWX_PROCESS,
    tracking_id: awxId,
    tracking_info: output,
    created_at: ended_at,
  };
  if (output) {
    messageTrackingData.tracking_info = output;
  }

  await addNewMessageTracking(messageTrackingData);
};

export const loadTrackingDataBy = (
  context: PortalContext,
  field: string,
  value: string
) => {
  return db<ActionTracking>(context, 'ActionTracking')
    .select([
      'ActionTracking.*',
      dbRaw(
        'case when count(distinct "MessageTracking".id) = 0 then \'[]\' else json_agg("MessageTracking".*) end as message_tracking'
      ),
    ])
    .leftJoin(
      'MessageTracking',
      'MessageTracking.tracking_id',
      '=',
      'ActionTracking.id'
    )
    .where({ [field]: value })
    .groupBy('ActionTracking.id')
    .orderBy('ActionTracking.created_at', 'desc');
};

export const unsecureLoadTrackingDataBy = (field: string, value: string) => {
  return dbUnsecure<ActionTracking>('ActionTracking')
    .select([
      'ActionTracking.*',
      dbRaw(
        'case when count(distinct "MessageTracking".id) = 0 then \'[]\' else json_agg("MessageTracking".*) end as message_tracking'
      ),
    ])
    .leftJoin(
      'MessageTracking',
      'MessageTracking.tracking_id',
      '=',
      'ActionTracking.id'
    )
    .where({ [field]: value })
    .groupBy('ActionTracking.id')
    .orderBy('ActionTracking.created_at', 'desc');
};
