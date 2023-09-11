'use server'

import {revalidatePath} from "next/cache";

export async function aboutSubmit() {
    revalidatePath('/services')
    return {message: 'Success!'}
}