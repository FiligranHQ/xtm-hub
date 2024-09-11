import { ActionTrackingId } from '../../../model/kanel/public/ActionTracking';
import { User } from '../../../model/user';

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
  community_id: string;
  user: User[];
}

export interface AWXUserCommunityFormatted
  extends Omit<AWXUserCommunity, 'community_user_list'> {
  community_user_list: string;
}

export const mapUserCommunityAWX = (
  { community_id, user }: InputUserCommunity,
  awx_client_request_id: ActionTrackingId
): AWXUserCommunityFormatted => {
  const userList = user.map(({ email, roles_portal_id }) => {
    return {
      user_email_address: email,
      role: roles_portal_id.some(({ name }) => name === 'ADMIN_ORGA')
        ? 'admin'
        : 'user',
    };
  });
  return {
    awx_client_request_id,
    community_id,
    community_user_list: JSON.stringify(userList),
  };
};
