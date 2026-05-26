export interface CopilotUser {
  id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  organizations?: ReadonlyArray<{
    readonly id: string;
    readonly name?: string | null;
    readonly personal_space?: boolean | null;
  }> | null;
  selected_organization_id?: string | null;
}

export const getUserKey = (u: CopilotUser | null | undefined): string => {
  if (!u) return 'anonymous';
  return `${u.id || 'no-id'}-${u.first_name || ''}-${u.last_name || ''}`;
};

export const buildContext = (
  user: CopilotUser | null | undefined,
  pathname: string
): string => {
  const context: Record<string, string> = {
    product: 'XTM Hub',
    page: pathname || '/',
  };

  if (user) {
    context.username =
      `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unknown';
    context.email = user.email;

    const selectedOrganization = user.organizations?.find(
      (org) => org.id === user.selected_organization_id
    );
    context.organization = selectedOrganization?.name || 'Unknown';
    context.isPersonalSpace = selectedOrganization?.personal_space
      ? 'true'
      : 'false';
  } else {
    context.username = 'Anonymous User';
    context.organization = 'Unknown';
  }

  return JSON.stringify(context);
};
