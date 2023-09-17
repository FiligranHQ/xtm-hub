import * as React from "react";
import serviceListQueryNode, {serviceListPreloaderQuery} from "../../__generated__/serviceListPreloaderQuery.graphql";
import ServiceListPreloader from "./service-list-preloader";
import loadSerializableQuery from "@/relay/loadSerializableQuery";

const DEFAULT_COUNT = 10;

const Page: React.FunctionComponent = async () => {
    const preloadedQuery = await loadSerializableQuery<typeof serviceListQueryNode, serviceListPreloaderQuery>(serviceListQueryNode, {
        count: DEFAULT_COUNT,
        orderBy: "name",
        orderMode: "asc"
    })
    return <>
        <div><b>SERVICE</b></div>
        <ServiceListPreloader preloadedQuery={preloadedQuery}/>
    </>
}

export default Page;

// export const dynamic = 'force-dynamic';
// export const revalidate = 0;