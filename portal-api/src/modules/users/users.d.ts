import { User } from '../../__generated__/resolvers-types';

type UserPassword = {
  password: string;
  salt: string;
};

export type UserWithAuthentication = UserPassword & User;
