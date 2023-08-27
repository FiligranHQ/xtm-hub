import { User } from "../__generated__/resolvers-types.js";

type UserPassword = {
    password: string
    salt: string
};

export type UserWithAuthentication = UserPassword & User