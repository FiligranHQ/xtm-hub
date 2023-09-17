"use client";

import {serviceListPreloaderQuery} from "../../__generated__/serviceListPreloaderQuery.graphql";
import * as React from "react";
import {useMemo} from "react";
import {
    graphql,
    PreloadedQuery,
    useFragment,
    useMutation,
    usePaginationFragment,
    usePreloadedQuery,
    useSubscription
} from "react-relay";
import Box from "@mui/material/Box";
import {ServiceListQuery} from "./service-list-preloader";
import {serviceList_services$key} from "../../__generated__/serviceList_services.graphql";
import Button from "@mui/material/Button";
import {useRouter} from "next/navigation";
import {serviceList_fragment$key} from "../../__generated__/serviceList_fragment.graphql";
import Typography from "@mui/material/Typography";
import {Controller, useForm} from "react-hook-form";
import TextField from "@mui/material/TextField";
import {yupResolver} from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {serviceListMutation} from "../../__generated__/serviceListMutation.graphql";

// region create form
const ServiceListCreateMutation = graphql`
    mutation serviceListMutation($name: String!, $connections: [ID!]!) {
        addService(name: $name) @prependNode(connections: $connections, edgeTypeName: "ServicesEdge") {
            ...serviceList_fragment
        }
    }
`;

interface FormData {
    name: string
}

interface ServiceCreateFormProps {
    connectionID: string;
}

const ServiceCreateForm: React.FunctionComponent<ServiceCreateFormProps> = ({connectionID}) => {
    const [commitServiceMutation] = useMutation<serviceListMutation>(ServiceListCreateMutation);
    const schema = Yup.object().shape({
        name: Yup.string().ensure().required("Field is required")
    });
    const {handleSubmit, control} = useForm<FormData>({
        resolver: yupResolver(schema),
    });
    const onSubmit = (variables: FormData) => {
        commitServiceMutation({variables: {connections: [connectionID], ...variables}})
    };
    return <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{mt: 1}}>
        <Controller control={control} name="name"
                    render={({field, fieldState: {error}}) => (
                        <TextField
                            {...field}
                            type="text"
                            fullWidth
                            label="Name"
                            error={!!error}
                            helperText={error?.message}
                        />
                    )}
        />
        <Button type="submit"
                fullWidth
                variant="contained"
                sx={{mt: 3, mb: 2}}>
            Create
        </Button>
    </Box>
}
// endregion

// region list
const serviceListFragment = graphql`
    fragment serviceList_fragment on Service {
        id
        name
    }
`;
const subscription = graphql`
    subscription serviceListSubscription($connections: [ID!]!) {
        Service {
            add @prependNode(connections: $connections, edgeTypeName: "ServicesEdge") {
                ...serviceList_fragment
            }
            edit {
                ...serviceList_fragment
            }
            delete {
                id @deleteRecord
            }
        }
    }
`;
const servicesListFragment = graphql`
    fragment serviceList_services on Query
    @refetchable(queryName: "ServicesPaginationQuery") {
        services(first: $count, after: $cursor, orderBy: $orderBy, orderMode: $orderMode) @connection(key: "Home_services") {
            __id # See https://relay.dev/docs/guided-tour/list-data/updating-connections/#using-declarative-directives
            edges {
                node {
                    id
                    ...serviceList_fragment
                }
            }
        }
    }
`;

interface ServiceItemProps {
    node: serviceList_fragment$key;
}

const ServiceItem: React.FunctionComponent<ServiceItemProps> = ({node}) => {
    const data = useFragment<serviceList_fragment$key>(serviceListFragment, node);
    return <li key={data?.id}>{data?.name}</li>;
}

interface ServiceProps {
    queryRef: PreloadedQuery<serviceListPreloaderQuery>
}

const ServiceList: React.FunctionComponent<ServiceProps> = ({queryRef}) => {
    const router = useRouter();
    const handleRefresh = () => {
        router.refresh();
    };
    const queryData = usePreloadedQuery<serviceListPreloaderQuery>(ServiceListQuery, queryRef);
    const {
        data,
        loadNext,
        isLoadingNext,
        isLoadingPrevious,
        refetch,
    } = usePaginationFragment<serviceListPreloaderQuery, serviceList_services$key>(servicesListFragment, queryData);

    const connectionID = data?.services?.__id;
    const config = useMemo(() => ({
        variables: {connections: [connectionID]},
        subscription,
    }), [connectionID]);

    useSubscription(config);
    return <>
        <React.Suspense fallback="Loading...">
            <Box sx={{bgcolor: '#e9cffc'}}>
                <ul>{data.services?.edges.map(({node}) => <ServiceItem key={node?.id} node={node}/>)}</ul>
                {isLoadingNext && <span>... next loading ...</span>}
                {isLoadingPrevious && <span>... previous loading ...</span>}
                <Button onClick={() => loadNext(1)}>Load more</Button>
            </Box>
            <div>
                <button onClick={handleRefresh}># Router refresh #</button>
            </div>
            <div>
                <button onClick={() => refetch({orderBy: "name", orderMode: "desc"})}># Reverse order #</button>
            </div>
        </React.Suspense>
        <Typography style={{marginTop: 20}} component="h1" variant="h5">
            - Create new service -
        </Typography>
        <ServiceCreateForm connectionID={connectionID}/>
    </>
};
// endregion

export default ServiceList;