'use server';
import { revalidatePath } from 'next/cache';

export default async function revalidatePathActions(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}
