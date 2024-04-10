export const initAWXEndpoint = (app) => {
  app.post(`/awx/callback`, (req, res, next) => {
    console.log("AWX req body", req.body)
    res.sendStatus(200);
  });

};
