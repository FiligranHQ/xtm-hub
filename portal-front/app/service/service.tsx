"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import serviceQueryNode, {serviceQuery} from "../../__generated__/serviceQuery.graphql";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import ServiceComponent from "./service-component";

export const ServiceQuery = graphql`
    query serviceQuery($count: Int!, $cursor: ID, $orderBy: ServiceOrdering!, $orderMode: OrderingMode!) {
        ...serviceComponent_services
    }
`;

const ServicePage = (props: { preloadedQuery: SerializablePreloadedQuery<typeof serviceQueryNode, serviceQuery> }) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    return <>
        <div><b>ServiceComponent</b></div>
        <ServiceComponent queryRef={queryRef}/>
    </>
};

export default ServicePage;