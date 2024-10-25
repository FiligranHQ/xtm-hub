export interface RolePortal {
  id: string;
  name?: string;
}

export interface UserInfo {
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
}
