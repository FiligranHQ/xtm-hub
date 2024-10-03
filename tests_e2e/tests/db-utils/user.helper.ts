import {db} from "./db-connection";
export const removeUser = async (email: string) => {
    await db("User").delete('*').where('email', '=', email)
};
