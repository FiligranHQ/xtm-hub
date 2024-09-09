import config from 'config';
import {
  AWXAction,
  AWXActionFunctionMap,
  AwxResponse,
  AWXWorkflowAction,
  AWXWorkflowConfig,
} from './awx.model';
import { AWX_HEADERS, AWX_URL, AWX_WORKFLOW_URL } from './awx.const';
import { buildCreateUserInput } from './awx-user-mapping';
import { ActionTrackingId } from '../../model/kanel/public/ActionTracking';
import { initTracking } from '../../modules/tracking/tracking.domain';
import { addNewMessageTracking } from '../../modules/tracking/message-tracking';
import { TrackingConst } from '../../modules/tracking/tracking.const';
import { mapCommunityAWX } from './community/awx-community.helper';

export const launchAWXWorkflow = async (action: AWXWorkflowAction) => {
  const awx = config.get('awx.activate');
  if (!awx) {
    return;
  }
  const awxUUID = await initTracking(action);
  const awxWorkflow: AWXWorkflowConfig = config.get(
    `awx.action_mapping.${action.type}`
  );
  const workflow = await fetchAWXWorkflow(awxWorkflow.path, awxUUID);
  return await executeAWXWorkflow(workflow, action, awxUUID, awxWorkflow.keys);
};

export const awxGetWorkflow = async (apiURL: string): Promise<AwxResponse> => {
  const url = `${AWX_URL}${apiURL}`;
  const response = await fetch(url, { headers: AWX_HEADERS });
  return (await response.json()) as AwxResponse;
};

export const awxLaunchWorkflowId = async (
  workflow: AwxResponse,
  body: object
) => {
  if (workflow.count === 0) {
    throw new Error(`Error we did not find any result`);
  }
  const workflowId = workflow.results[0].id;
  const url =
    AWX_URL +
    AWX_WORKFLOW_URL.replace('${workflowId}', workflowId.toString(10));
  const awxWorkflow = await fetch(url, {
    headers: AWX_HEADERS,
    body: JSON.stringify(body),
    method: 'POST',
  }).catch(function (error) {
    console.log(error);
    return Promise.reject(error);
  });
  return await awxWorkflow.json();
};

const buildWorkflowInput = async (
  action: AWXWorkflowAction,
  awxUUID: ActionTrackingId,
  keys: string[]
) => {
  const workflowInput: AWXActionFunctionMap = {
    [AWXAction.CREATE_USER]: buildCreateUserInput,
    [AWXAction.DISABLE_USER]: buildCreateUserInput,
    [AWXAction.CREATE_COMMUNITY]: mapCommunityAWX,
  };

  const selectedFunction = workflowInput[action.type];
  if (!selectedFunction) {
    throw new Error(`Unsupported action type: ${action.type}`);
  }
  return await selectedFunction(action.input, awxUUID, keys);
};

const fetchAWXWorkflow = async (path: string, awxUUID: ActionTrackingId) => {
  const workflow = await awxGetWorkflow(path);
  await addNewMessageTracking({
    ...TrackingConst.GET_AWX_WORKFLOW_REQUEST,
    tracking_id: awxUUID,
    tracking_info: workflow,
  });
  return workflow;
};

const executeAWXWorkflow = async (
  workflow: AwxResponse,
  action: AWXWorkflowAction,
  awxUUID: ActionTrackingId,
  keys: string[]
) => {
  const extraVars = await buildWorkflowInput(action, awxUUID, keys);
  const response = await awxLaunchWorkflowId(workflow, {
    extra_vars: extraVars,
  });
  await addNewMessageTracking({
    ...TrackingConst.EXECUTE_AWX_REQUEST,
    tracking_id: awxUUID,
    tracking_info: response,
  });
  return response;
};
