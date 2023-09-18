import * as React from "react";
import loadSerializableQuery from "@/relay/loadSerializableQuery";
import userListPreloaderQueryNode, {
    userListPreloaderQuery
} from "../../../__generated__/userListPreloaderQuery.graphql";
import UserListPreloader from "./user-list-preloader";

const DEFAULT_COUNT = 10;

const Page = async () => {
    const preloadedQuery = await loadSerializableQuery<typeof userListPreloaderQueryNode, userListPreloaderQuery>(userListPreloaderQueryNode, {
        count: DEFAULT_COUNT,
        orderBy: "email",
        orderMode: "asc"
    })
    return <UserListPreloader preloadedQuery={preloadedQuery}/>
}

export default Page;