import {query} from "./db-connection";
import { v4 as uuidv4 } from 'uuid';
export const removeOrganization = async (name: string) => {
    await query('DELETE FROM "Organization" WHERE name = $1', [name]);
};

export const addOrganization = async(organizationName: string) => {
    const result = await query('SELECT 1 FROM "Organization" WHERE name = $1', [organizationName]);

    if (result.rowCount === 0) {
        await query('INSERT INTO "Organization"(id, name) VALUES($1, $2)', [uuidv4(), organizationName]);
    } else {
        console.log('Organization already exists');
    }
}