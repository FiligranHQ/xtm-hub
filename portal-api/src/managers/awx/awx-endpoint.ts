import { updateActionTracking } from '../../modules/common/action-tracking';

export const awxEndpoint = (app) => {
  app.post(`/awx/callback`, async (req, res, next) => {
    console.log('AWX req', req.body);
    if (req.body) {
      const { id: awxUUID, status, output } = req.body;
      await updateActionTracking(awxUUID, {
        status,
        output,
      });
    }
    res.send(200);
  });

};
