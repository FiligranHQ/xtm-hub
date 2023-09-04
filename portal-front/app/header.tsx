"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import headerQueryNode, {headerQuery} from "../__generated__/headerQuery.graphql";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import HeaderComponent from "@/components/header/header";
import * as React from "react";

const Header = (props: { preloadedQuery: SerializablePreloadedQuery<typeof headerQueryNode, headerQuery> }) => {
    const queryRef = useSerializablePreloadedQuery(props.preloadedQuery);
    return <HeaderComponent queryRef={queryRef}/>
};

export default Header;