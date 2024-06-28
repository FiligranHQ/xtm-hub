import { RequestParameters, UploadableMap, Variables } from 'relay-runtime';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export const fetchFormData = async (
  apiUri: string,
  request: RequestParameters,
  variables: Variables,
  uploadables: FileList,
  portalCookie?: RequestCookie
) => {
  const headers: { [k: string]: string } = {
    Accept: 'application/json',
    'apollo-require-preflight': 'true',
  };
  if (!window.FormData) {
    throw new Error('Uploading files without `FormData` not supported.');
  }
  if (!uploadables) {
    throw new Error('`uploadables` is not defined.');
  }

  const formData = new FormData();
  formData.append('operations', JSON.stringify({ query: request.text }));
  const uploadablesArray = Array.from(uploadables);
  const map = uploadablesArray.reduce((acc, _, index) => {
    // @ts-ignore
    acc[index] = [`variables.file${uploadables.length > 1 ? '.' + index : ''}`];
    return acc;
  }, {});
  formData.append('map', JSON.stringify(map));

  Object.keys(uploadables).forEach((key) => {
    console.log({ key });
    if (Object.prototype.hasOwnProperty.call(uploadables, key)) {
      // @ts-ignore
      formData.append(key, uploadables[key]);
    }
  });

  if (portalCookie) {
    headers.cookie = portalCookie.name + '=' + portalCookie.value;
  }
  const resp = await fetch(apiUri, {
    method: 'POST',
    credentials: 'same-origin',
    headers,
    cache: portalCookie ? 'no-store' : undefined,
    body: formData,
  });
  const json = await resp.json();
  // GraphQL returns exceptions (for example, a missing required variable) in the "errors"
  // property of the response. If any exceptions occurred when processing the request,
  // throw an error to indicate to the developer what went wrong.
  if (Array.isArray(json.errors)) {
    const containsAuthenticationFailure =
      json.errors.find((e: any) => e.extensions.code === 'UNAUTHENTICATED') !==
      undefined;
    if (containsAuthenticationFailure) {
      throw new Error('UNAUTHENTICATED');
    }
    throw new Error(json.errors[0].message);
  }
  return json;
};
