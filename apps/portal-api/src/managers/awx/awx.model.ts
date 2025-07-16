import { ActionTrackingId } from '../../model/kanel/public/ActionTracking';
import User from '../../model/kanel/public/User';
import { InputCreateCommunity } from './community/awx-community.helper';
import { InputAddServiceCommunityAWX } from './community/awx-service-community.helper';
import { InputUserCommunity } from './community/awx-user-community.helper';
import { UserEmailInput, UserInput } from './user/awx-user-mapping';

export interface AWUserInput extends User {
  awx_client_request_id: ActionTrackingId;
}

export enum AWXAction {
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER', // api_update-user
  DISABLE_USER = 'DISABLE_USER', // api_disable-user
  ADD_PLTF_USER = 'ADD_PLTF_USER', // api_admin-ptf-add-user
  REMOVE_PLTF_USER = 'REMOVE_PLTF_USER', // api_admin-ptf-remove-user
  CREATE_COMMUNITY = 'CREATE_COMMUNITY', // api_create-community
  UPDATE_COMMUNITY = 'UPDATE_COMMUNITY', // api_update-community
  DELETE_COMMUNITY = 'DELETE_COMMUNITY', // api_delete-community
  COMMUNITY_ADD_SERVICE = 'COMMUNITY_ADD_SERVICE', // api_add-community-service
  COMMUNITY_UPDATE_SERVICE = 'COMMUNITY_UPDATE_SERVICE', // api_update-community-service
  COMMUNITY_DELETE_SERVICE = 'COMMUNITY_DELETE_SERVICE', // api_delete-community-service
  COMMUNITY_ADD_USERS = 'COMMUNITY_ADD_USERS', // api_add-community-users
  COMMUNITY_REMOVE_USERS = 'COMMUNITY_REMOVE_USERS', // api_remove-community-users
  ORGANIZATION_ADD_SERVICE = 'ORGANIZATION_ADD_SERVICE', // api_add-organization-service
  ORGANIZATION_UPDATE_SERVICE = 'ORGANIZATION_UPDATE_SERVICE', // api_update-organization-service
  ORGANIZATION_DELETE_SERVICE = 'ORGANIZATION_DELETE_SERVICE', // api_delete-organization-service
  ORGANIZATION_ADD_USERS = 'ORGANIZATION_ADD_USERS', // api_add-organization-users
  ORGANIZATION_REMOVE_USERS = 'ORGANIZATION_REMOVE_USERS', // api_remove-organization-users
}

export type AWXActionFunctionMap = {
  [key in AWXAction]: (...args: unknown[]) => Promise<unknown> | unknown;
};

interface AwxCreateUserAction {
  type: AWXAction.CREATE_USER;
  input: UserInput;
}
interface AwxUpdateUserAction {
  type: AWXAction.UPDATE_USER;
  input: UserInput;
}

interface AwxDisableUserAction {
  type: AWXAction.DISABLE_USER;
  input: UserEmailInput;
}

interface AwxAddAdminPlfAction {
  type: AWXAction.ADD_PLTF_USER;
  input: UserEmailInput;
}
interface AwxDeleteAdminPlfAction {
  type: AWXAction.REMOVE_PLTF_USER;
  input: UserEmailInput;
}

interface AwxCreateCommunityAction {
  type: AWXAction.CREATE_COMMUNITY;
  input: InputCreateCommunity;
}

interface AwxDeleteCommunityAction {
  type: AWXAction.DELETE_COMMUNITY;
  input: {
    community_id: string;
  };
}

interface AwxAddUsersInCommunityAction {
  type: AWXAction.COMMUNITY_ADD_USERS;
  input: InputUserCommunity;
}

interface AwxRemoveUsersInCommunityAction {
  type: AWXAction.COMMUNITY_REMOVE_USERS;
  input: InputUserCommunity;
}

interface AwxAddServiceInCommunityAction {
  type: AWXAction.COMMUNITY_ADD_SERVICE;
  input: InputAddServiceCommunityAWX;
}

interface AwxDeleteServiceInCommunityAction {
  type: AWXAction.COMMUNITY_DELETE_SERVICE;
  input: InputAddServiceCommunityAWX;
}

export type AWXWorkflowAction =
  | AwxCreateUserAction
  | AwxUpdateUserAction
  | AwxDisableUserAction
  // Integrate the different function
  | AwxCreateCommunityAction
  | AwxDeleteCommunityAction
  | AwxAddAdminPlfAction
  | AwxDeleteAdminPlfAction
  | AwxAddUsersInCommunityAction
  | AwxRemoveUsersInCommunityAction
  | AwxAddServiceInCommunityAction
  | AwxDeleteServiceInCommunityAction;

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
