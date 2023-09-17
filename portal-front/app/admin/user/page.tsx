import * as React from "react";
import loadSerializableQuery from "@/relay/loadSerializableQuery";
import userPreloaderQueryNode, {userPreloaderQuery} from "../../../__generated__/userPreloaderQuery.graphql";
import UserListPreloader from "./user-list-preloader";

const DEFAULT_COUNT = 10;


const Page = async () => {
    const preloadedQuery = await loadSerializableQuery<typeof userPreloaderQueryNode,userPreloaderQuery>(userPreloaderQueryNode, {
        count: DEFAULT_COUNT,
        orderBy: "email",
        orderMode: "asc"
    })
    return <UserListPreloader preloadedQuery={preloadedQuery}/>
}

export default Page;