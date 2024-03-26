import config from 'config';
import { AwxResponse } from '../../model/awx-response';

const AWX_URL = config.get('awx.url');
const AWX_TOKEN = config.get('awx.token');
const AWX_HEADERS = {
  'Authorization': 'Bearer ' + AWX_TOKEN,
  'Content-Type': 'application/json',
};

export interface AWXAddUserInput {
  awx_client_request_id: string,
  organization_name: string,
  user_email_address: string,
  user_firstname: string,
  user_lastname: string,
  user_role: string
}


export const awxGetWorkflow = async (workflowName: string): Promise<AwxResponse> => {
  console.log({ AWX_URL });
  console.log({ AWX_TOKEN });
  const url = AWX_URL + '/api/v2/workflow_job_templates/?name=' + workflowName;
  const response = await fetch(url, { headers: AWX_HEADERS });
  return await response.json() as AwxResponse;
};

export const awxLaunchWorkflowId = async (workflowId: number, body: object) => {
  const url = AWX_URL + '/api/v2/workflow_job_templates/' + workflowId + '/launch/';
  const workflow = await fetch(url, {
    headers: AWX_HEADERS,
    body: JSON.stringify(body),
    method: 'POST',
  }).catch(
    function(error) {
      console.log(error);
      return Promise.reject(error);
    },
  );
  const response = await workflow.json();
  console.log(response);
  return response;
};

export const awxRunCreateUserWorkflow = async (createUser: AWXAddUserInput) => {
  const workflowName = 'api_create-user';
  const workflow = await awxGetWorkflow(workflowName);
  const body = {
    'extra_vars': createUser,
  };
  if (workflow.count > 0) {
    const workflowId = workflow.results[0].id;
    return await awxLaunchWorkflowId(workflowId, body);
  }

};
