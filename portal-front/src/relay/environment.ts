import {
    CacheConfig,
    Environment,
    GraphQLResponse,
    Network,
    QueryResponseCache,
    RecordSource,
    RequestParameters,
    Store,
    Variables,
} from "relay-runtime";
import {RequestCookie} from "next/dist/compiled/@edge-runtime/cookies";

export const IS_SERVER = typeof window === typeof undefined;
const CACHE_TTL = 5 * 1000; // 5 seconds, to resolve preloaded results

export async function networkFetch(request: RequestParameters, variables: Variables, portalCookie?: RequestCookie): Promise<GraphQLResponse> {
    const headers: {[k: string]: string } = {
        Accept: "application/json",
        "Content-Type": "application/json",
    };
    if (IS_SERVER && portalCookie) {
        headers.cookie = portalCookie.name + '=' + portalCookie.value;
    }
    const resp = await fetch('http://localhost:3001/graphql', {
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

export const responseCache: QueryResponseCache | null = IS_SERVER
    ? null
    : new QueryResponseCache({
        size: 100,
        ttl: CACHE_TTL,
    });

function createNetwork() {
    async function fetchResponse(params: RequestParameters, variables: Variables, cacheConfig: CacheConfig) {
        const isQuery = params.operationKind === "query";
        const cacheKey = params.id ?? params.cacheID;
        const forceFetch = cacheConfig && cacheConfig.force;
        if (responseCache != null && isQuery && !forceFetch) {
            const fromCache = responseCache.get(cacheKey, variables);
            console.log('Find responseCache in cache', cacheKey);
            if (fromCache != null) {
                console.log('fetchResponse IN CACHE')
                return Promise.resolve(fromCache);
            }
        }
        console.log('fetchResponse NO CACHE')
        return networkFetch(params, variables);
    }
    return Network.create(fetchResponse);
}

function createEnvironment() {
    return new Environment({
        network: createNetwork(),
        store: new Store(RecordSource.create()),
        isServer: IS_SERVER,
    });
}

export const environment = createEnvironment();

export function getCurrentEnvironment() {
    if (IS_SERVER) {
        return createEnvironment();
    }

    return environment;
}