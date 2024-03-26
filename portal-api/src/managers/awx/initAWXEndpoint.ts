export const initAWXEndpoint = (app) => {
  app.post(`/awx/callback`, (req, res, next) => {
    console.log('AWX req', req);
    console.log('AWX res', res);
  });

};
