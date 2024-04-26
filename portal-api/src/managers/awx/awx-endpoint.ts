import { endAWXTracking } from '../../modules/tracking/tracking.domain';

export const awxEndpoint = (app) => {
  app.post(`/awx/callback`, async (req, res, next) => {
    console.log('AWX req', req.body);
    if (req.body) {
      const { id: awxUUID, status, output } = req.body;
      await endAWXTracking(awxUUID, status, output);

    }
    res.send(200);
  });

};
