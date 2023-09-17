"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import serviceListQueryNode, {serviceListPreloaderQuery} from "../../__generated__/serviceListPreloaderQuery.graphql";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import ServiceList from "./service-list";

export const ServiceListQuery = graphql`
    query serviceListPreloaderQuery($count: Int!, $cursor: ID, $orderBy: ServiceOrdering!, $orderMode: OrderingMode!) {
        ...serviceList_services
    }
`;

const ServiceListPreloader = (props: {
    preloadedQuery: SerializablePreloadedQuery<typeof serviceListQueryNode, serviceListPreloaderQuery>
}) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    return <>
        <div><b>ServiceComponent</b></div>
        <ServiceList queryRef={queryRef}/>
    </>
};

export default ServiceListPreloader;