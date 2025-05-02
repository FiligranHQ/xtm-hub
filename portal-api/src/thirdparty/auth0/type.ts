export interface Auth0UpdateUser {
  email: string;
  first_name?: string;
  last_name?: string;
  picture?: string;
  country?: string;
}

export interface Auth0Client {
  updateUser(user: Auth0UpdateUser): Promise<void>;
  resetPassword(email: string): Promise<void>;
}
