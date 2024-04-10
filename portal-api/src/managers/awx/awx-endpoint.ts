export const awxEndpoint = (app) => {
  app.post(`/awx/callback`, (req, res, next) => {
    console.log('AWX req', req.body);
    res.send(200);
  });

};
