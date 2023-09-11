"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import {graphql, PreloadedQuery, usePreloadedQuery} from "react-relay";
import {homeQuery} from "../../../__generated__/homeQuery.graphql";
import {useRouter} from "next/navigation";

const HomeQuery = graphql`
    query homeQuery {
        organizations {
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
`;

interface HomeProps {
    queryRef: PreloadedQuery<homeQuery>
}

const Home: React.FunctionComponent<HomeProps> = ({queryRef}) => {
    const router = useRouter();
    const handleRefresh = () => {
        router.refresh();
    };
    const data = usePreloadedQuery<homeQuery>(HomeQuery, queryRef);
    return <React.Suspense fallback="Loading...">
        <Box sx={{bgcolor: '#e9cffc'}}>
            <ul>{data.organizations?.edges.map(({ node }) => <li key={node?.id}>{node?.name}</li>)}</ul>
        </Box>
        <div>
            <button onClick={handleRefresh}>Refresh</button>
        </div>
    </React.Suspense>
};

export default Home;