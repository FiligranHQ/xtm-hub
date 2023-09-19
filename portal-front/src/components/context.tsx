"use client";

import {preloaderLayoutQuery} from "../../__generated__/preloaderLayoutQuery.graphql";
import * as React from "react";
import {createContext} from "react";
import {graphql, PreloadedQuery, useFragment, usePreloadedQuery} from "react-relay";
import {context_fragment$data, context_fragment$key} from "../../__generated__/context_fragment.graphql";
import {CAPABILITY_BYPASS} from "@/utils/constant";
import {PreloaderQuery} from "../../app/preloader";

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

const ContextFragment = graphql`
    fragment context_fragment on User {
        id
        email
        capabilities {
            name
        }
    }
`;

interface PortalContextProps {
    queryRef: PreloadedQuery<preloaderLayoutQuery>
    children: React.ReactNode
}

const PortalContext: React.FunctionComponent<PortalContextProps> = ({queryRef, children}) => {
    const data = usePreloadedQuery<preloaderLayoutQuery>(PreloaderQuery, queryRef);
    const me = useFragment<context_fragment$key>(ContextFragment, data.me);
    return <portalContext.Provider value={generatePortalContext(me)}>{children}</portalContext.Provider>
};

export default PortalContext;