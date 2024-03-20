export interface Role {
  name: string;
  id: string;
}

export interface RoleCapability {
  id: string;
  capability_portal_id: string;
  role_portal_id: string;
}
