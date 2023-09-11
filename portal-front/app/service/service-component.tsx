"use client";

import {serviceQuery} from "../../__generated__/serviceQuery.graphql";
import * as React from "react";
import {useMemo} from "react";
import {
    graphql,
    PreloadedQuery,
    useFragment,
    usePaginationFragment,
    usePreloadedQuery,
    useSubscription
} from "react-relay";
import Box from "@mui/material/Box";
import {ServiceQuery} from "./service";
import {serviceComponent_services$key} from "../../__generated__/serviceComponent_services.graphql";
import Button from "@mui/material/Button";
import {useRouter} from "next/navigation";
import {serviceComponent_fragment$key} from "../../__generated__/serviceComponent_fragment.graphql";
import {RecordSourceSelectorProxy} from "relay-runtime";

const serviceComponentFragment = graphql`
    fragment serviceComponent_fragment on Service {
        id
        name
    }
`;

const subscription = graphql`
    subscription serviceComponentSubscription($connections: [ID!]!) {
        Service {
            add @prependNode(connections: $connections, edgeTypeName: "ServicesEdge") {
                ...serviceComponent_fragment
            }
            edit {
                ...serviceComponent_fragment
            }
            delete {
                id @deleteRecord
            }
        }
    }
`;

const servicesFragment = graphql`
    fragment serviceComponent_services on Query
    @refetchable(queryName: "ServicesPaginationQuery") {
        services(first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode) @connection(key: "Home_services") {
            __id # See https://relay.dev/docs/guided-tour/list-data/updating-connections/#using-declarative-directives
            edges {
                node {
                    id
                    ...serviceComponent_fragment
                }
            }
        }
    }
`;

interface ServiceItemProps {
    node: serviceComponent_fragment$key;
}
const ServiceItem: React.FunctionComponent<ServiceItemProps> = ({node}) => {
    const data = useFragment<serviceComponent_fragment$key>(serviceComponentFragment, node);
    return <li key={data?.id}>{data?.name}</li>;
}

interface ServiceProps {
    queryRef: PreloadedQuery<serviceQuery>
}
const ServiceComponent: React.FunctionComponent<ServiceProps> = ({queryRef}) => {
    const router = useRouter();
    const handleRefresh = () => {
        router.refresh();
    };
    const queryData = usePreloadedQuery<serviceQuery>(ServiceQuery, queryRef);
    const {
        data,
        loadNext,
        isLoadingNext,
        isLoadingPrevious,
        refetch,
    } = usePaginationFragment<serviceQuery, serviceComponent_services$key>(servicesFragment, queryData);

    const connectionID = data?.services?.__id;
    const config = useMemo(() => ({
        variables: { connections: [connectionID]},
        subscription,
        updater: (store: RecordSourceSelectorProxy<unknown>) => {
            // router.refresh();
        }
    }), [connectionID]);

    useSubscription(config);
    return <React.Suspense fallback="Loading...">
        <Box sx={{bgcolor: '#e9cffc'}}>
            <ul>{data.services?.edges.map(({node}) => <ServiceItem key={node?.id} node={node}/>)}</ul>
            { isLoadingNext && <span>... next loading ...</span>}
            { isLoadingPrevious && <span>... previous loading ...</span>}
            <Button onClick={() => loadNext(1)}>Load more</Button>
        </Box>
        <div>
            <button onClick={handleRefresh}># Router refresh #</button>
        </div>
        <div>
            <button onClick={() => refetch({ orderBy: "name", orderMode: "desc"})}># Reverse order #</button>
        </div>
    </React.Suspense>
};

export default React.memo(ServiceComponent);