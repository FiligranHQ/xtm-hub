import z from 'zod';

export const extractDomain = (email: string) => {
  return email.split('@')[1];
};

export const isValidEmail = (email: string) => {
  return z.string().email().safeParse(email).success;
};
