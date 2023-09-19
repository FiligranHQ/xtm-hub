"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import preloaderServiceQueryNode, {preloaderServiceQuery} from "../../__generated__/preloaderServiceQuery.graphql";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import ServiceList from "@/components/service/service-list";

// Configuration or Preloader Query
export const PreloaderQuery = graphql`
    query preloaderServiceQuery($count: Int!, $cursor: ID, $orderBy: ServiceOrdering!, $orderMode: OrderingMode!) {
        ...serviceList_services
    }
`;

// Component interface
interface ServiceListPreloaderProps {
    preloadedQuery: SerializablePreloadedQuery<typeof preloaderServiceQueryNode, preloaderServiceQuery>
}

// Component
const Preloader: React.FunctionComponent<ServiceListPreloaderProps> = ({preloadedQuery}) => {
    const queryRef = useSerializablePreloadedQuery(preloadedQuery);
    return <>
        <div><b>ServiceComponent</b></div>
        <ServiceList queryRef={queryRef}/>
    </>
};

// Component export
export default Preloader;