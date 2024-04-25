import config from 'config';
import { AWXAction, AWXActionFunctionMap, AwxResponse, AWXWorkflowAction, AWXWorkflowConfig } from './awx.model';
import { AWX_HEADERS, AWX_URL, AWX_WORKFLOW_URL } from './awx.const';
import { buildCreateUserInput } from './awx-user-mapping';
import { ActionTrackingId } from '../../model/kanel/public/ActionTracking';
import { initTracking } from '../../modules/tracking/tracking.domain';
import { addNewMessageTracking } from '../../modules/tracking/message-tracking';
import { TrackingConst } from '../../modules/tracking/tracking.const';

export const launchAWXWorkflow = async (action: AWXWorkflowAction) => {
  const awxWorkflow: AWXWorkflowConfig = config.get(`awx.action_mapping.${action.type}`);
  if (!awxWorkflow) {
    throw new Error(`awx.action_mapping.${action.type} is not defined`);
  }
  const awxUUID = await initTracking(action);
  const workflow = await awxGetWorkflow(awxWorkflow.path);
  await addNewMessageTracking({
    ...TrackingConst.GET_AWX_WORKFLOW_REQUEST,
    tracking_id: awxUUID,
    tracking_info: workflow,
  });

  return await awxLaunchWorkflowId(workflow, {
    'extra_vars': await buildWorkflowInput(action, awxUUID, awxWorkflow.keys),
  }).then(async (response) => {
    await addNewMessageTracking({
      ...TrackingConst.EXECUTE_AWX_REQUEST,
      tracking_id: awxUUID,
      tracking_info: response,
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
