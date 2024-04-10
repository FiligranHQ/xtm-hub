import config from 'config';
import { AWXAction, AWXActionFunctionMap, AwxResponse, AWXWorkflowAction, AWXWorkflowConfig } from './awx.model';
import { AWX_HEADERS, AWX_URL, AWX_WORKFLOW_URL } from './awx.const';
import { buildCreateUserInput } from './awx-mapping';

export const launchAWXWorkflow = async (action: AWXWorkflowAction) => {
  const awxWorkflow: AWXWorkflowConfig = config.get(`awx.action_mapping.${action.type}`);
  if (!awxWorkflow) {
    throw new Error(`awx.action_mapping.${action.type} is not defined`);
  }

  const workflow = await awxGetWorkflow(awxWorkflow.path);

  return await awxLaunchWorkflowId(workflow, {
    'extra_vars': await buildWorkflowInput(action, awxWorkflow.keys),
  });
};

export const awxGetWorkflow = async (apiURL: string): Promise<AwxResponse> => {
  const url = `${AWX_URL}${apiURL}`;
  const response = await fetch(url, { headers: AWX_HEADERS });
  return await response.json() as AwxResponse;
};

export const awxLaunchWorkflowId = async (workflow: AwxResponse, body: object) => {
  if (workflow.count === 0) {
    throw new Error(`Error we did not find any result`);
  }
  const workflowId = workflow.results[0].id;
  const url = AWX_URL + AWX_WORKFLOW_URL.replace('${workflowId}', workflowId.toString(10));
  const awxWorkflow = await fetch(url, {
    headers: AWX_HEADERS,
    body: JSON.stringify(body),
    method: 'POST',
  }).catch(
    function(error) {
      console.log(error);
      return Promise.reject(error);
    },
  );
  return await awxWorkflow.json();
};

const buildWorkflowInput = async (action: AWXWorkflowAction, keys: string[]) => {
  const workflowInput: AWXActionFunctionMap = {
    [AWXAction.CREATE_USER]: buildCreateUserInput,
    [AWXAction.DISABLE_USER]: buildCreateUserInput,
  };
  return await workflowInput[action.type](action.input, keys);
};
