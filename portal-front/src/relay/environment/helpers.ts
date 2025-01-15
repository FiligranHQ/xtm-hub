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

export const RELAY_WINDOW_KEY: string = `__RELAY`;

export function hasHydrationResponses() {
  return RELAY_WINDOW_KEY in window;
}

export function isRelayObservable(
  obj: unknown
): obj is Observable<GraphQLResponse> {
  return obj instanceof Observable;
}

interface Event {
  owner: string;
  fieldPath: string;
  error?: Error;
}

type EventKind =
  | 'read.missing_required_field'
  | 'missing_field.log'
  | 'missing_field.throw'
  | 'relay_resolver.error';

type EventHandler = (event: Event) => void;

const fieldHandlers: Record<EventKind, EventHandler> = {
  'read.missing_required_field': logMissingField,
  'missing_field.log': logMissingField,
  'missing_field.throw': throwMissingFieldError,
  'relay_resolver.error': logResolverError,
};

function logMissingField(event: Event): void {
  console.warn(`Field is missing: ${event.owner}.${event.fieldPath}`);
}

function throwMissingFieldError(event: Event): void {
  throw new Error(`Field is missing: ${event.owner}.${event.fieldPath}`);
}

function logResolverError(event: Event): void {
  console.warn(
    `Resolver error encountered in ${event.owner}.${event.fieldPath}`
  );
  if (event.error) {
    console.warn(event.error);
  }
}

export function fieldLogger(event: {
  kind: EventKind;
  owner: string;
  fieldPath: string;
  error?: Error;
}): void {
  console.log(event);
  const handler = fieldHandlers[event.kind];

  if (handler) {
    handler(event); // The event matches the handler's input type
  } else {
    console.warn(`No handler for event kind: ${event.kind}`);
  }
}
