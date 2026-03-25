import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { RequestParameters, UploadableMap, Variables } from 'relay-runtime';

const FILE_PREFIX_SEPARATOR = 'prefix-';

export const splitFileListToUploadableMap = (files: {
  [key: string]: FileList | (File | null)[];
}): UploadableMap => {
  const acc: UploadableMap = {};
  Object.entries(files).forEach(([key, fileList]) => {
    Array.from(fileList).forEach((file) => {
      if (!file) return;
      acc[`${key}${FILE_PREFIX_SEPARATOR}${file.name}`] = file;
    });
  });
  return acc;
};

export const fileListToUploadableMap = (
  files: FileList | (File | null)[]
): UploadableMap =>
  Array.from(files).reduce((acc, file) => {
    if (file) {
      acc[file.name] = file;
    }
    return acc;
  }, {} as UploadableMap);

export const fetchFormData = async (
  apiUri: string,
  request: RequestParameters,
  variables: Variables,
  uploadables: UploadableMap,
  portalCookie?: RequestCookie
) => {
  const headers: { [k: string]: string } = {
    Accept: 'application/json',
    'apollo-require-preflight': 'true',
  };
  if (!window.FormData) {
    throw new Error('Uploading files without `FormData` not supported.');
  }

  const formData = new FormData();
  formData.append(
    'operations',
    JSON.stringify({ query: request.text, variables })
  );

  const keyMapping: Record<string, number> = {};
  const uploadableKeys = Object.keys(uploadables);
  const map = uploadableKeys.reduce<{ [key: number]: string[] }>(
    (acc, uploadableKey, index) => {
      const splitted = uploadableKey.split(FILE_PREFIX_SEPARATOR);
      const variableName = splitted.length > 1 ? splitted[0]! : 'document';

      if (uploadableKeys.length === 1) {
        acc[index] = [`variables.${variableName}`];
        return acc;
      }

      if (keyMapping[variableName] === undefined) {
        keyMapping[variableName] = 0;
      } else {
        keyMapping[variableName] = keyMapping[variableName] + 1;
      }

      acc[index] = [`variables.${variableName}.${keyMapping[variableName]}`];

      return acc;
    },
    {}
  );
  formData.append('map', JSON.stringify(map));

  Object.values(uploadables).forEach((file, index) =>
    formData.append(String(index), file)
  );

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
      json.errors.find(
        (e: { extensions: { code: string } }) =>
          e.extensions.code === 'UNAUTHENTICATED'
      ) !== undefined;
    if (containsAuthenticationFailure) {
      throw new Error('UNAUTHENTICATED');
    }
    throw new Error(json.errors[0].message);
  }
  return json;
};
