import User from '../../model/kanel/public/User';
import { ActionTrackingId } from '../../model/kanel/public/ActionTracking';

export interface AWXAddUserInput {
  awx_client_request_id: ActionTrackingId,
  organization_name: string,
  user_email_address: string,
  user_firstname: string,
  user_lastname: string,
  user_role: string,
  user_reset_password: string
}

export interface AWUserInput extends User {
  awx_client_request_id: ActionTrackingId,
}

export enum AWXAction {
  CREATE_USER = 'CREATE_USER',
  DISABLE_USER = 'DISABLE_USER'
}

export type AWXActionFunctionMap = {
  [key in AWXAction]: any;
};

interface AwxCreateUserAction {
  type: AWXAction.CREATE_USER,
  input: User
}

interface AwxDisableUserAction {
  type: AWXAction.DISABLE_USER,
  input: User
}

export type AWXWorkflowAction = AwxCreateUserAction|AwxDisableUserAction;

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
