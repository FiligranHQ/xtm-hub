import User from '../../model/kanel/public/User';
import { ActionTrackingId } from '../../model/kanel/public/ActionTracking';
import { InputCommunity } from './community/awx-community.helper';

export interface AWXAddUserInput {
  awx_client_request_id: ActionTrackingId;
  organization_name: string;
  user_email_address: string;
  user_firstname: string;
  user_lastname: string;
  user_roles: string[];
  user_reset_password: string;
}

export interface AWUserInput extends User {
  awx_client_request_id: ActionTrackingId;
}

export enum AWXAction {
  CREATE_USER = 'CREATE_USER',
  DISABLE_USER = 'DISABLE_USER',
  CREATE_COMMUNITY = 'CREATE_COMMUNITY',
}

export type AWXActionFunctionMap = {
  [key in AWXAction]: (...args: unknown[]) => Promise<unknown> | unknown;
};

interface AwxCreateUserAction {
  type: AWXAction.CREATE_USER;
  input: UserInput;
}

interface AwxDisableUserAction {
  type: AWXAction.DISABLE_USER;
  input: UserInput;
}
interface AwxCreateCommunityAction {
  type: AWXAction.CREATE_COMMUNITY;
  input: InputCommunity;
}

export type AWXWorkflowAction =
  | AwxCreateUserAction
  | AwxDisableUserAction
  | AwxCreateCommunityAction;

export interface AwxResponse {
  count: number;
  results: AwxResult[];
}

interface AwxResult {
  id: number;
  type: string;
  url: string;
  created: string;
  modified: string;
  name: string;
  description: string;
}

export interface AWXWorkflowConfig {
  path: string;
  keys: string[];
}

export interface UserInput extends User {
  roles: string[];
}
