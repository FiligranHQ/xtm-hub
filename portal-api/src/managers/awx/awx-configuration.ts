import config from 'config';
import { AWXAction, AWXActionFunctionMap, AwxResponse, AWXWorkflowAction, AWXWorkflowConfig } from './awx.model';
import { AWX_HEADERS, AWX_URL, AWX_WORKFLOW_URL } from './awx.const';
import { buildCreateUserInput } from './awx-user-mapping';
import { v4 as uuidv4 } from 'uuid';
import { addNewActionTracking, updateActionTracking } from '../../modules/common/action-tracking';
import { ActionTrackingId } from '../../model/kanel/public/ActionTracking';

export const launchAWXWorkflow = async (action: AWXWorkflowAction) => {
  const awxWorkflow: AWXWorkflowConfig = config.get(`awx.action_mapping.${action.type}`);
  if (!awxWorkflow) {
    throw new Error(`awx.action_mapping.${action.type} is not defined`);
  }
  const awxUUID = await initActionTracking(action);
  const workflow = await awxGetWorkflow(awxWorkflow.path);
  await updateActionTracking(awxUUID, {
    status: 'GET_WORKFLOW_REQUEST',
    output: workflow,
  });

  return await awxLaunchWorkflowId(workflow, {
    'extra_vars': await buildWorkflowInput(action, awxUUID, awxWorkflow.keys),
  }).then(async (response) => {
    await updateActionTracking(awxUUID, {
      status: 'EXECUTE_REQUEST',
      output: response,
    });
    return response;
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

const buildWorkflowInput = async (action: AWXWorkflowAction, awxUUID: ActionTrackingId, keys: string[]) => {
  const workflowInput: AWXActionFunctionMap = {
    [AWXAction.CREATE_USER]: buildCreateUserInput,
    [AWXAction.DISABLE_USER]: buildCreateUserInput,
  };
  const selectedFunction = workflowInput[action.type];
  if (!selectedFunction) {
    throw new Error(`Unsupported action type: ${action.type}`);
  }
  return await selectedFunction(action.input, awxUUID, keys);
};

const initActionTracking = async (action: AWXWorkflowAction) => {
  const id = uuidv4() as ActionTrackingId;
  await addNewActionTracking({
    id,
    type: action.type,
    contextual_id: action.input.id,
  });
  return id;
};
