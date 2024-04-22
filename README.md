# cloud-portal

Filigran cloud portal

# Deployment

The portal require to have 2 docker containers.
One for the API (GraphQL).
One for the Front (NextJS) that will generate SSR front and handle api proxified requests.
**Frontend will also directly take to the API to generate SSR. For this reason you need to specify the SERVER_HTTP_API
helper variable**

## Simple docker commands

docker run -p 4001:4001 --network=portal --name=portal-api portal-api
docker run -p 3000:3000 --network=portal --name=portal-front --env SERVER_HTTP_API=http://portal-api:4001 portal-front 
