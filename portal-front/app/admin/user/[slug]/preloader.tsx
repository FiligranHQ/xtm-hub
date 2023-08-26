"use client";

import {SerializablePreloadedQuery} from "@/relay/loadSerializableQuery";
import * as React from "react";
import useSerializablePreloadedQuery from "@/hooks/useSerializablePreloadedQuery";
import {graphql} from "react-relay";
import UserSlug from "@/components/admin/user/[slug]/user-slug";
import preloaderUserSlugQueryNode, {
    preloaderUserSlugQuery
} from "../../../../__generated__/preloaderUserSlugQuery.graphql";

// Configuration or Preloader Query
export const PreloaderQuery = graphql`
    query preloaderUserSlugQuery($id: ID!){
        user(id: $id) {
            ...userSlug_fragment
        }
    }
`;

// Component interface
interface PreloaderProps {
    preloadedQuery: SerializablePreloadedQuery<typeof preloaderUserSlugQueryNode, preloaderUserSlugQuery>
}

// Component
const Preloader: React.FunctionComponent<PreloaderProps> = ({preloadedQuery}) => {
    const queryRef = useSerializablePreloadedQuery(preloadedQuery);
    return <UserSlug queryRef={queryRef}/>
};

// Component export
export default Preloader;