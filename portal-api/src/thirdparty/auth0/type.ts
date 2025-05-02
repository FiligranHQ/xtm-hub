export interface Auth0UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  picture?: string;
  password?: string;
  country?: string;
}

export interface Auth0Management {
  updateUser(id: string, user: Auth0UpdateUserPayload): Promise<void>;
  updateUserWithoutPassword(
    id: string,
    user: Auth0UpdateUserPayload
  ): Promise<void>;
}
