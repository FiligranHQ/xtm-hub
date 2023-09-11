"use client";

import {graphql, PreloadedQuery, useFragment, usePreloadedQuery} from "react-relay";
import {headerQuery} from "../../../__generated__/headerQuery.graphql";
import {header_fragment$key} from "../../../__generated__/header_fragment.graphql";
import * as React from "react";
import RouterLink from "next/link";
import Box from "@mui/material/Box";
import HeaderLogout from "@/components/header/header-logout";

const homeFragment = graphql`
    fragment header_fragment on User {
        id
        email
    }
`;

const homeUserQuery = graphql`
    query headerQuery {
        me {
            ...header_fragment
        }
    }
`;

interface OrganizationsProps {
    queryRef: PreloadedQuery<headerQuery>
}

const HeaderComponent: React.FunctionComponent<OrganizationsProps> = ({ queryRef }) => {
    const data = usePreloadedQuery<headerQuery>(homeUserQuery, queryRef);
    const fragment = useFragment<header_fragment$key>(homeFragment, data.me);
    return <React.Suspense fallback="Loading...">
        <Box sx={{ bgcolor: '#cfe8fc' }}>
            <ul>
                <li><RouterLink prefetch={true} href="/about">About Us</RouterLink></li>
                <li><RouterLink prefetch={true} href="/service">Services</RouterLink></li>
            </ul>
            <div>{fragment?.email}</div>
            <HeaderLogout/>
        </Box>
    </React.Suspense>
}
export default HeaderComponent;
