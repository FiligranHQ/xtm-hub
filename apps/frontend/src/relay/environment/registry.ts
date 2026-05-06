import { Environment } from 'relay-runtime';

let _clientEnvironment: Environment | null = null;

export const registerClientEnvironment = (env: Environment | null): void => {
  _clientEnvironment = env;
};

export const getClientEnvironment = (): Environment | null =>
  _clientEnvironment;
