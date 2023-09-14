import * as React from "react";
import loadSerializableQuery from "@/relay/loadSerializableQuery";
import userQueryNode, {userQuery} from "../../../__generated__/userQuery.graphql";
import UserPreloader from "./user-preloader";

const DEFAULT_COUNT = 10;

const Page = async () => {
    const preloadedQuery = await loadSerializableQuery<typeof userQueryNode, userQuery>(userQueryNode, {
        count: DEFAULT_COUNT,
        orderBy: "email",
        orderMode: "asc"
    })
    return <>
        <div><b>USERS</b></div>
        <UserPreloader preloadedQuery={preloadedQuery}/>
    </>
}

export default Page;