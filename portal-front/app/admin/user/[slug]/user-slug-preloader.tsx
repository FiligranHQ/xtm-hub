"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import UserSlug from "./user-slug";
import userSlugPreloaderQueryNode, {userSlugPreloaderQuery} from "../../../../__generated__/userSlugPreloaderQuery.graphql";

export const userSlugQuery = graphql`
    query userSlugPreloaderQuery($id: ID!){
        node(id: $id) {
            id
            ...on User {
                email
                first_name
                last_name
            }
        }
    }
`;

const UserSlugPreloader = (props: { preloadedQuery: SerializablePreloadedQuery<typeof userSlugPreloaderQueryNode, userSlugPreloaderQuery> }) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    return <UserSlug queryRef={queryRef}/>
};

export default UserSlugPreloader;