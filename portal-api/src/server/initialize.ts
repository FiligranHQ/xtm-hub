import portalConfig from "../config.js";
import {dbTx, dbUnsecure} from "../../knexfile.js";
import {Organization, User} from "../__generated__/resolvers-types.js";
import crypto from "node:crypto";
import {UserWithAuthentication} from "../users/users.js";

export const ADMIN_UUID = 'ba091095-418f-4b4f-b150-6c9295e232c3';
export const PLATFORM_ORGANIZATION_UUID = 'ba091095-418f-4b4f-b150-6c9295e232c4';

export const hashPassword = (password: string) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return {salt, hash};
}

const initializeBuiltInAdministrator = async () => {
    // Initialize default admin user
    const {email, password} = portalConfig.admin;
    const adminUser = await dbUnsecure<User>('User').where({id: ADMIN_UUID}).first();
    const {salt, hash} = hashPassword(password);
    const data = {salt, password: hash};
    // User already exists
    if (adminUser) {
        // Update the password and salt
        await dbUnsecure<UserWithAuthentication>('User').where({id: ADMIN_UUID}).update(data).returning('*');
    } else { // User not yet exist, need a complete init
        const trx = await dbTx();
        // Check the platform organization
        const adminOrganization = await dbUnsecure<User>('Organization').where({id: PLATFORM_ORGANIZATION_UUID}).first();
        if (!adminOrganization) {
            await dbUnsecure<Organization>('Organization')
                .insert({id: PLATFORM_ORGANIZATION_UUID, name: 'Internal'}).transacting(trx)
                .returning('*');
        }
        const data = {id: ADMIN_UUID, email, salt, password: hash, organization_id: PLATFORM_ORGANIZATION_UUID};
        await dbUnsecure<UserWithAuthentication>('User').insert(data).transacting(trx).returning('*');
        trx.commit();
    }
}

const platformInit = async () => {
    await initializeBuiltInAdministrator();
}

export default platformInit;