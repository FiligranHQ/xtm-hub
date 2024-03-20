import { Restriction } from '../__generated__/resolvers-types.js';

export interface User {
  id: string;
  email: string;
  capabilities: { id: string, name: Restriction }[];
  organization_id: string;
  organization: { id: string, name?: string };
}
