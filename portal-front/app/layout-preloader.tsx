"use client";

import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import contextQueryNode, {contextQuery} from "../__generated__/contextQuery.graphql";
import * as React from "react";
import Context from "@/components/context";

interface LayoutPreloaderProps {
    preloadedQuery: SerializablePreloadedQuery<typeof contextQueryNode, contextQuery>
    children: React.ReactNode
}

const LayoutPreloader: React.FunctionComponent<LayoutPreloaderProps> = ({preloadedQuery, children}) => {
    const queryRef = useSerializablePreloadedQuery(preloadedQuery);
    return <Context queryRef={queryRef}>{children}</Context>
}

export default LayoutPreloader;