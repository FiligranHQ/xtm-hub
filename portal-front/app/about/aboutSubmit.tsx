'use server'

import {revalidatePath} from "next/cache";

export async function aboutSubmit() {
    revalidatePath('/service')
    return { message: 'Success!' }
}