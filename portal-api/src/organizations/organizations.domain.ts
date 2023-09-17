import {Organization} from "../__generated__/resolvers-types.js";
import {db} from "../../knexfile.js";
import {PortalContext} from "../index.js";

export const loadOrganizationBy = async (context: PortalContext, field: string, value: string): Promise<Organization> => {
    return db<Organization>(context, 'Organization').where({[field]: value}).select('*').first();
}
