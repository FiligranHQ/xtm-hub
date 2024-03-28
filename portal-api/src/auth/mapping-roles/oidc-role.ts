export const mapOIDCUserRole = (role: string) => {
  const roleMappings = {
    'admin': 'ADMIN',
    'user': 'USER',
  };
  return roleMappings[role] ?? role;
};
