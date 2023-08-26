import {GraphQLResponse, OperationType, VariablesOf,} from "relay-runtime";
import {ConcreteRequest} from "relay-runtime/lib/util/RelayConcreteNode";
import {getGraphqlApi, networkFetch} from "./environment";
import {cookies} from "next/headers";

export interface SerializablePreloadedQuery<
    TRequest extends ConcreteRequest,
    TQuery extends OperationType
> {
    request: TRequest
    variables: VariablesOf<TQuery>;
    response: GraphQLResponse;
}

// Call into raw network fetch to get serializable GraphQL query response
// This response will be sent to the client to "warm" the QueryResponseCache
// to avoid the client fetches.
export default async function loadSerializableQuery<TRequest extends ConcreteRequest, TQuery extends OperationType>(
    request: TRequest,
    variables: VariablesOf<TQuery>
): Promise<SerializablePreloadedQuery<TRequest, TQuery>> {
    const portalCookie = cookies().get('cloud-portal');
    const apiDestination = getGraphqlApi(true, 'api');
    const response = await networkFetch(apiDestination, request.params, variables, portalCookie);
    return {request, variables, response};
}