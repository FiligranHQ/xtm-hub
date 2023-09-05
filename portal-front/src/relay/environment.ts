import {
    Environment,
    GraphQLResponse,
    Network,
    Observable,
    RecordSource,
    RequestParameters,
    Store,
    Variables,
} from "relay-runtime";
import {createClient} from 'graphql-ws';
import {RequestCookie} from "next/dist/compiled/@edge-runtime/cookies";

const uri = 'localhost:3001/graphql';

export async function networkFetch(request: RequestParameters, variables: Variables, portalCookie?: RequestCookie): Promise<GraphQLResponse> {
    const headers: { [k: string]: string } = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    if (portalCookie) {
        headers.cookie = portalCookie.name + '=' + portalCookie.value;
    }
    const resp = await fetch('http://' + uri, {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({query: request.text, variables}),
    });
    const json = await resp.json();
    console.log('>>>>>>>>>>>>>>>>>>>> networkFetch (' + portalCookie?.name + ')', request.name, JSON.stringify(json))
    // GraphQL returns exceptions (for example, a missing required variable) in the "errors"
    // property of the response. If any exceptions occurred when processing the request,
    // throw an error to indicate to the developer what went wrong.
    if (Array.isArray(json.errors)) {
        // console.log(json.errors)
        const containsAuthenticationFailure = json.errors.find((e: any) => e.extensions.code === 'UNAUTHENTICATED') !== undefined;
        if (containsAuthenticationFailure) {
            throw new Error('UNAUTHENTICATED');
        }
        throw new Error('TECHNICAL');
    }
    return json;
}

const subscriptionsClient = createClient({url: 'ws://' + uri});

function fetchOrSubscribe(operation: RequestParameters, variables: Variables): Observable<any> {
    return Observable.create((sink) => {
        if (!operation.text) {
            return sink.error(new Error('Operation text cannot be empty'));
        }
        return subscriptionsClient.subscribe(
            {
                operationName: operation.name,
                query: operation.text,
                variables,
            },
            sink,
        );
    });
}

function createNetwork() {
    async function fetchResponse(params: RequestParameters, variables: Variables) {
        return networkFetch(params, variables);
    }

    return Network.create(fetchResponse, fetchOrSubscribe);
}

function createEnvironment() {
    return new Environment({
        network: createNetwork(),
        store: new Store(RecordSource.create()),
    });
}

export const environment = createEnvironment();