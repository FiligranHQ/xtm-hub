export interface Auth0UpdateUser {
  email: string;
  first_name?: string;
  last_name?: string;
  picture?: string;
  country?: string;
}

export interface Auth0Management {
  updateUser(user: Auth0UpdateUser): Promise<void>;
}
