import {query} from "./db-connection";
export const removeUser = async (email: string) => {
    await query('DELETE FROM "User" WHERE email = $1', [email]);
};
