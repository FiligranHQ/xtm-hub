"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import userQueryNode, {userQuery} from "../../../__generated__/userQuery.graphql";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import UserComponent from "./user-component";

// region queries and fragments
export const usersFragment = graphql`
    fragment user_users on Query
    @refetchable(queryName: "UsersPaginationQuery") {
        users(first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode) @connection(key: "Admin_users") {
            __id # See https://relay.dev/docs/guided-tour/list-data/updating-connections/#using-declarative-directives
            edges {
                node {
                    id
                    email
                }
            }
        }
    }
`;
export const UserQuery = graphql`
    query userQuery($count: Int!, $cursor: ID, $orderBy: UserOrdering!, $orderMode: OrderingMode!) {
        ...user_users
    }
`;
// endregion

const UserPreloader = (props: { preloadedQuery: SerializablePreloadedQuery<typeof userQueryNode, userQuery> }) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    return <UserComponent queryRef={queryRef}/>
};

export default UserPreloader;