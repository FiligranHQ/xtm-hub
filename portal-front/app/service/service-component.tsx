"use client";

import {serviceQuery} from "../../__generated__/serviceQuery.graphql";
import * as React from "react";
import {PreloadedQuery, usePreloadedQuery} from "react-relay";
import Box from "@mui/material/Box";
import {ServiceQuery} from "./service";

interface ServiceProps {
    queryRef: PreloadedQuery<serviceQuery>
}

const ServiceComponent: React.FunctionComponent<ServiceProps> = ({queryRef}) => {
    const data = usePreloadedQuery<serviceQuery>(ServiceQuery, queryRef);
    console.log('SERVICE COMPONENT')
    return <React.Suspense fallback="Loading...">
        <Box sx={{bgcolor: '#e9cffc'}}>
            <ul>{data.organizations?.edges.map(({ node }) => <li key={node?.id}>{node?.name}</li>)}</ul>
        </Box>
    </React.Suspense>
};

export default ServiceComponent;