"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import userPreloaderQueryNode, {userPreloaderQuery} from "../../../__generated__/userPreloaderQuery.graphql";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import UserList from "./user-list";

// region queries and fragments
export const usersFragment = graphql`
    fragment userPreloader_users on Query
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
    query userPreloaderQuery($count: Int!, $cursor: ID, $orderBy: UserOrdering!, $orderMode: OrderingMode!) {
        ...userPreloader_users
    }
`;
// endregion

const UserListPreloader = (props: { preloadedQuery: SerializablePreloadedQuery<typeof userPreloaderQueryNode, userPreloaderQuery> }) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    return <UserList queryRef={queryRef}/>
};

export default UserListPreloader;