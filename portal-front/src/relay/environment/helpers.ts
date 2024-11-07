import {
  GraphQLResponse,
  Observable,
  RequestParameters,
  Variables,
} from 'relay-runtime';

export function buildQueryId(request: RequestParameters, variables: Variables) {
  const queryId = request.id ?? request.name;

  return `${queryId}:${JSON.stringify(variables)}`;
}

export const RELAY_WINDOW_KEY = `__RELAY`;

export function hasHydrationResponses() {
  return RELAY_WINDOW_KEY in window;
}

export function isRelayObservable(
  obj: any
): obj is Observable<GraphQLResponse> {
  return obj instanceof Observable;
}

const fieldHandlers = {
  'read.missing_required_field': (event: {
    owner: string;
    fieldPath: string;
  }) => {
    console.warn(`Field is missing: ${event.owner}.${event.fieldPath}`);
  },
  'missing_field.log': (event: { owner: string; fieldPath: string }) => {
    console.warn(`Field is missing: ${event.owner}.${event.fieldPath}`);
  },
  'missing_field.throw': (event: { owner: string; fieldPath: string }) => {
    throw new Error(`Field is missing: ${event.owner}.${event.fieldPath}`);
  },
  'relay_resolver.error': (event: {
    owner: string;
    fieldPath: string;
    error: Error;
  }) => {
    console.warn(
      `Resolver error encountered in ${event.owner}.${event.fieldPath}`
    );
    console.warn(event.error);
  },
};

export function fieldLogger(event: {
  kind: keyof typeof fieldHandlers;
  owner: string;
  fieldPath: string;
  error?: Error;
}) {
  console.log(event);
  const handler = fieldHandlers[event.kind];
  if (handler) {
    handler(event as any); // Type assertion to match handler's expected input
  } else {
    console.warn(`No handler for event kind: ${event.kind}`);
  }
}
