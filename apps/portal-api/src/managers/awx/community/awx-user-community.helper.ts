import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';

export interface UserWithRoleCommunity {
  email: string;
  admin: boolean;
}
export interface AWXUserCommunity {
  awx_client_request_id: string;
  community_id: string;
  community_user_list: UserCommunity[];
}
interface UserCommunity {
  user_email_address: string;
  role: 'user' | 'admin';
}

export interface InputUserCommunity {
  id: string;
  users: UserWithRoleCommunity[];
}

export interface AWXUserCommunityFormatted
  extends Omit<AWXUserCommunity, 'community_user_list'> {
  community_user_list: string;
}

export const mapUserCommunityAWX = (
  { id, users }: InputUserCommunity,
  awx_client_request_id: ActionTrackingId
): AWXUserCommunityFormatted => {
  const userList = users.map(({ email, admin }) => {
    return {
      user_email_address: email,
      role: admin ? 'admin' : 'user',
    };
  });
  return {
    awx_client_request_id,
    community_id: id,
    community_user_list: JSON.stringify(userList),
  };
};
