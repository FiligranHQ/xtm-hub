const NotAuthorizeEmail = ['gmail.com', 'yahoo.com', 'hotmail.com'];

export const isAuthorizedEmail = (email: string) => {
  const domain = extractDomain(email);
  return !NotAuthorizeEmail.includes(domain);
};

export const extractDomain = (email: string) => {
  return email.split('@')[1];
};
