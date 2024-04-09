import config from 'config';
import { AwxResponse } from '../../model/awx-response';
import { v4 as uuidv4 } from 'uuid';
import User from '../../model/kanel/public/User';
import { loadOrganizationBy } from '../../modules/organizations/organizations';

const AWX_URL: string = config.get('awx.url');
const AWX_TOKEN: string = config.get('awx.token');
const AWX_WORKFLOW_URL: string = config.get(`awx.workflow`);
const AWX_HEADERS = {
  'Authorization': 'Bearer ' + AWX_TOKEN,
  'Content-Type': 'application/json',
};

type AWXActionFunctionMap = {
  [key in AWXAction]: any;
};

export interface AWXAddUserInput {
  awx_client_request_id: string,
  organization_name: string,
  user_email_address: string,
  user_firstname: string,
  user_lastname: string,
  user_role: string,
  user_reset_password: string
}

export enum AWXAction {
  CREATE_USER = 'CREATE_USER',
  DISABLE_USER = 'DISABLE_USER'
}

interface AwxCreateUserAction {
  type: AWXAction.CREATE_USER,
  input: User
}

interface AwxDisableUserAction {
  type: AWXAction.DISABLE_USER,
  input: User
}

type AWXWorkflowAction = AwxCreateUserAction|AwxDisableUserAction;

export const launchAWXWorkflow = async (action: AWXWorkflowAction) => {
  const workflow = await awxGetWorkflow(action.type);
  if (workflow.count > 0) {
    const workflowId = workflow.results[0].id;
    return await awxLaunchWorkflowId(workflowId, {
      'extra_vars': await buildWorkflowInput(action),
    });
  }
  throw new Error(`awx.action_mapping.${action.type} is not defined`);
};
export const awxGetWorkflow = async (workflowName: AWXAction): Promise<AwxResponse> => {
  const apiURL = config.get(`awx.action_mapping.${workflowName}`);
  if (!apiURL) {
    throw new Error(`awx.action_mapping.${workflowName} is not defined`);
  }
  const url = `${AWX_URL}${apiURL}`;
  const response = await fetch(url, { headers: AWX_HEADERS });
  return await response.json() as AwxResponse;
};

export const awxLaunchWorkflowId = async (workflowId: number, body: object) => {
  const url = AWX_URL + AWX_WORKFLOW_URL.replace('${workflowId}', workflowId.toString(10));
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
  return await workflow.json();
};
const buildCreateUserInput = async (input: User) => {
  // Here add a reducer which add the corresponding
  const orgInfo = await loadOrganizationBy('id', input.organization_id);
  const awxAddUserInput: AWXAddUserInput = {
    awx_client_request_id: uuidv4(),
    organization_name: orgInfo.name,
    user_email_address: input.email,
    user_firstname: input.first_name,
    user_lastname: input.last_name,
    user_reset_password: input.password,
    user_role: 'admin',
  };
  return awxAddUserInput;
};

const buildWorkflowInput = async (action: AWXWorkflowAction) => {
  const workflowInput: AWXActionFunctionMap = {
    [AWXAction.CREATE_USER]: buildCreateUserInput,
    [AWXAction.DISABLE_USER]: buildCreateUserInput,
  };
  return await workflowInput[action.type](action.input);
};
