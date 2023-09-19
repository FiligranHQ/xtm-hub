"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import userListPreloaderQueryNode, {userListPreloaderQuery} from "../../../__generated__/userListPreloaderQuery.graphql";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import UserList from "@/components/admin/user/user-list";

// region queries and fragments
export const usersFragment = graphql`
    fragment userListPreloader_users on Query
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
export const UserListQuery = graphql`
    query userListPreloaderQuery($count: Int!, $cursor: ID, $orderBy: UserOrdering!, $orderMode: OrderingMode!) {
        ...userListPreloader_users
    }
`;
// endregion

const UserListPreloader = (props: { preloadedQuery: SerializablePreloadedQuery<typeof userListPreloaderQueryNode, userListPreloaderQuery> }) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    return <UserList queryRef={queryRef}/>
};

export default UserListPreloader;