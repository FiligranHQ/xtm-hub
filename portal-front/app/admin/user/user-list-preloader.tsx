"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import userListPreloaderQueryNode, {userListPreloaderQuery} from "../../../__generated__/userListPreloaderQuery.graphql";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import UserList from "@/components/admin/user/user-list";

export const UserListQuery = graphql`
    query userListPreloaderQuery($count: Int!, $cursor: ID, $orderBy: UserOrdering!, $orderMode: OrderingMode!) {
        ...userList_users
    }
`;

const UserListPreloader = (props: { preloadedQuery: SerializablePreloadedQuery<typeof userListPreloaderQueryNode, userListPreloaderQuery> }) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    return <UserList queryRef={queryRef}/>
};

export default UserListPreloader;