"use client";

import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import preloaderLayoutQueryNode, {preloaderLayoutQuery} from "../__generated__/preloaderLayoutQuery.graphql";
import * as React from "react";
import Context from "@/components/context";
import {graphql} from "react-relay";

// Configuration or Preloader Query
export const PreloaderQuery = graphql`
    query preloaderLayoutQuery {
        me {
            ...context_fragment
        }
    }
`;

// Component interface
interface LayoutPreloaderProps {
    preloadedQuery: SerializablePreloadedQuery<typeof preloaderLayoutQueryNode, preloaderLayoutQuery>
    children: React.ReactNode
}

// Component
const Preloader: React.FunctionComponent<LayoutPreloaderProps> = ({preloadedQuery, children}) => {
    const queryRef = useSerializablePreloadedQuery(preloadedQuery);
    return <Context queryRef={queryRef}>{children}</Context>
}

// Component export
export default Preloader;