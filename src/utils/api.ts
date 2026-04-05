import { API_BASE } from '../config';

const defaultHeaders = () => ({ 'Content-Type': 'application/json' });

type ApiErrorResponse = {
  errors?: string[];
};

const parseResponseBody = (text: string): unknown => {
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const hasErrorList = (value: unknown): value is ApiErrorResponse => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const errors = Reflect.get(value, 'errors');
  return Array.isArray(errors) && errors.every((error) => typeof error === 'string');
};

const getErrorMessage = (data: unknown, fallbackMessage: string): string => {
  if (hasErrorList(data) && data.errors && data.errors.length > 0) {
    return data.errors[0];
  }

  if (typeof data === 'string' && data.length > 0) {
    return data;
  }

  return fallbackMessage;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE}/${path}`, init);
  const data = parseResponseBody(await response.text());

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.statusText));
  }

  return data as T;
};

export const get = <T>(path: string): Promise<T> =>
  request<T>(path, { headers: defaultHeaders() });

export const post = <TResponse, TBody>(path: string, data: TBody): Promise<TResponse> =>
  request<TResponse>(path, {
    headers: defaultHeaders(),
    method: 'POST',
    body: JSON.stringify(data),
  });

export const update = <TResponse, TBody>(path: string, data: TBody): Promise<TResponse> =>
  request<TResponse>(path, {
    headers: defaultHeaders(),
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const remove = async (
  entity: string,
  idKey: string | number = 'id',
): Promise<void> => {
  await request<void>(`${entity}/${idKey}`, {
    method: 'DELETE',
  });
};
