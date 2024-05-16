import { endTracking, unsecureLoadTrackingDataBy } from '../../modules/tracking/tracking.domain';
import { dispatch } from '../../pub';

export const awxEndpoint = (app) => {
  app.post(`/awx/callback`, async (req, res) => {
    console.log('AWX req', req.body);
    if (req.body) {
      const { id: awxUUID, status, output } = req.body;
      await endTracking(awxUUID, status, output);
      const [tracking] = await unsecureLoadTrackingDataBy('ActionTracking.id', awxUUID);
      await dispatch('ActionTracking', 'edit', tracking);
    }
    res.sendStatus(200);
  });
};
