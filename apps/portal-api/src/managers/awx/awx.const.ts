import config from 'config';

export const AWX_URL: string = config.get('awx.url');
export const AWX_TOKEN: string = config.get('awx.token');
export const AWX_WORKFLOW_URL: string = config.get(`awx.workflow`);
export const AWX_HEADERS = {
  Authorization: 'Bearer ' + AWX_TOKEN,
  'Content-Type': 'application/json',
};
