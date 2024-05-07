import { endTracking } from '../../modules/tracking/tracking.domain';

export const awxEndpoint = (app) => {
  app.post(`/awx/callback`, async (req, res) => {
    console.log('AWX req', req.body);
    if (req.body) {
      const { id: awxUUID, status, output } = req.body;
      await endTracking(awxUUID, status, output);
    }
    res.send(200);
  });
};
