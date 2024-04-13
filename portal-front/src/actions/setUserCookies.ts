'use server';
import { cookies } from 'next/headers';

export async function setUserCookies(me: string) {
  cookies().set('cloud-portal-user', me);
}
