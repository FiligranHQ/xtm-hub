import { UserList_fragment$data } from '@generated/UserList_fragment.graphql';

export type PendingUserAction = 'approve' | 'deny';

export interface PendingUserDialogState {
  action: PendingUserAction;
  user: UserList_fragment$data;
}
