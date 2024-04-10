import config from 'config';
import { AWXAction, AWXActionFunctionMap, AwxResponse, AWXWorkflowAction } from './awx.model';
import { AWX_HEADERS, AWX_URL, AWX_WORKFLOW_URL } from './awx.const';
import { buildCreateUserInput } from './awx-mapping';

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

const buildWorkflowInput = async (action: AWXWorkflowAction) => {
  const workflowInput: AWXActionFunctionMap = {
    [AWXAction.CREATE_USER]: buildCreateUserInput,
    [AWXAction.DISABLE_USER]: buildCreateUserInput,
  };
  return await workflowInput[action.type](action.input);
};
