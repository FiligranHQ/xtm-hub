import Link from "next/link";
import * as React from "react";
import serviceQueryNode, {serviceQuery} from "../../__generated__/serviceQuery.graphql";
import ServicePage from "./service";
import loadSerializableQuery from "@/relay/loadSerializableQuery";

const Page: React.FunctionComponent = async () => {
    console.log('SERVICE PAGE QUERY')
    const preloadedQuery = await loadSerializableQuery<typeof serviceQueryNode, serviceQuery>(serviceQueryNode, {})
    return <>
        <div><b>SERVICE</b></div>
        <ServicePage preloadedQuery={preloadedQuery}/>
        <Link prefetch={false} href="/">Home</Link>
    </>
}

export default Page;