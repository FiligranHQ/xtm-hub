import {graphql} from "react-relay";
import {Control} from "react-hook-form";
import {AutoCompleteSelect} from "@/form/AutoCompleteSelect";
import {
    OrganizationsSelectQuery,
    OrganizationsSelectQuery$data
} from "../../__generated__/OrganizationsSelectQuery.graphql";
import * as React from "react";

const organizationFetch = graphql`
    query OrganizationsSelectQuery {
        organizations {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
`;
export const OrganizationsSelect = ({name, label, control}: { name: string, label: string, control: Control<any> }) => {
    return <AutoCompleteSelect<OrganizationsSelectQuery, OrganizationsSelectQuery$data>
        name={name} label={label} query={organizationFetch} control={control}
        transformer={(data) => data.organizations.edges.map((e) => ({id: e.node.id, name: e.node.name ?? e.node.id}))}
    />
}