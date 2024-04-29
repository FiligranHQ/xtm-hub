import { addNewMessageTracking } from '../../modules/tracking/message-tracking';
import { TrackingConst } from '../../modules/tracking/tracking.const';
import { endTracking } from '../../modules/tracking/tracking.domain';

export const awxEndpoint = (app) => {
    app.post(`/awx/callback`, async (req, res, next) => {
        console.log('AWX req', req.body);
        if (req.body) {
            const { id: awxUUID, status, output } = req.body;
            await addNewMessageTracking({
                ...TrackingConst.END_AWX_PROCESS,
                tracking_id: awxUUID,
                tracking_info: output,
            });
            await endTracking(awxUUID);
        }
        res.send(200);
    });
};
