const NotAuthorizeEmail = ['gmail.com', 'yahoo.com', 'hotmail.com'];

export const isAuthorizedEmail = (email: string) => {
  const domain = email.split('@')[1];
  return !NotAuthorizeEmail.includes(domain);
};
