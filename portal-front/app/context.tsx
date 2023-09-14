"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import contextQueryNode, {contextQuery} from "../__generated__/contextQuery.graphql";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import * as React from "react";
import {createContext} from "react";
import {graphql, useFragment, usePreloadedQuery} from "react-relay";
import {context_fragment$data, context_fragment$key} from "../__generated__/context_fragment.graphql";
import {CAPABILITY_BYPASS} from "@/constant";

export interface Portal {
    me?: context_fragment$data | null
    hasCapability?: (capability: string) => boolean
}

export const portalContext = createContext<Portal>({});

const generatePortalContext = (me: context_fragment$data | null): Portal => {
    return {
        me,
        hasCapability: (capability: string) => {
            const userCapabilities = (me?.capabilities ?? []).map((c) => c?.name);
            return userCapabilities.includes(CAPABILITY_BYPASS) || userCapabilities.includes(capability);
        }
    }
}

const homeFragment = graphql`
    fragment context_fragment on User {
        id
        email
        capabilities {
            name
        }
    }
`;
const homeUserQuery = graphql`
    query contextQuery {
        me {
            ...context_fragment
        }
    }
`;

const PortalContext = (props: {
    preloadedQuery: SerializablePreloadedQuery<typeof contextQueryNode, contextQuery>,
    children: React.ReactNode
}) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    const data = usePreloadedQuery<contextQuery>(homeUserQuery, queryRef);
    const me = useFragment<context_fragment$key>(homeFragment, data.me);
    return <portalContext.Provider value={generatePortalContext(me)}>{props.children}</portalContext.Provider>
};

export default PortalContext;