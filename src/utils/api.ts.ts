import { API_BASE } from '../config';

const defaultHeaders = () => ({ 'Content-Type': 'application/json' });

type ApiErrorResponse = {
  errors?: string[];
};

function parseResponseBody(text: string): unknown {
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function hasErrorList(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const errors = Reflect.get(value, 'errors');
  return Array.isArray(errors) && errors.every((error) => typeof error === 'string');
}

function getErrorMessage(data: unknown, fallbackMessage: string): string {
  if (hasErrorList(data) && data.errors && data.errors.length > 0) {
    return data.errors[0];
  }

  if (typeof data === 'string' && data.length > 0) {
    return data;
  }

  return fallbackMessage;
}

async function fetchData<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const data = parseResponseBody(await response.text());

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.statusText));
  }

  return data as T;
}

export const get = async <T>(path: string): Promise<T> => {
  const url = `${API_BASE}/${path}`;
  const headers = defaultHeaders();

  return fetchData(url, { headers });
};

export const post = async <TResponse, TBody>(path: string, data: TBody): Promise<TResponse> => {
  const url = `${API_BASE}/${path}`;
  const headers = defaultHeaders();

  return fetchData(url, {
    headers,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const update = async <TResponse, TBody>(path: string, data: TBody): Promise<TResponse> => {
  const url = `${API_BASE}/${path}`;
  const headers = defaultHeaders();

  return fetchData(url, {
    headers,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const remove = async (
  entity: string,
  idKey: string | number = 'id',
): Promise<void> => {
  const url = `${API_BASE}/${entity}/${idKey}`;

  await fetchData<void>(url, {
    method: 'DELETE',
  });
};
