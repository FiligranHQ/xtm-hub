import * as React from "react";
import serviceQueryNode, {serviceQuery} from "../../__generated__/serviceQuery.graphql";
import ServicePage from "./service";
import loadSerializableQuery from "@/relay/loadSerializableQuery";

const Page: React.FunctionComponent = async () => {
    const preloadedQuery = await loadSerializableQuery<typeof serviceQueryNode, serviceQuery>(serviceQueryNode, {
        count: 10,
        orderBy: "name",
        orderMode: "asc"
    })
    return <>
        <div><b>SERVICE</b></div>
        <ServicePage preloadedQuery={preloadedQuery}/>
    </>
}

export default Page;

export const dynamic = 'force-dynamic';
export const revalidate = 0;