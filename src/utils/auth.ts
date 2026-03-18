import { API_BASE } from '../config';
import { AuthSessionResponse } from '../types';

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

function hasErrors(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const errors = Reflect.get(value, 'errors');
  return Array.isArray(errors) && errors.every((error) => typeof error === 'string');
}

function getErrorMessage(data: unknown, fallbackMessage: string): string {
  if (hasErrors(data) && data.errors && data.errors.length > 0) {
    return data.errors[0];
  }

  if (typeof data === 'string' && data.length > 0) {
    return data;
  }

  return fallbackMessage;
}

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  const data = parseResponseBody(await response.text());

  if (!response.ok) {
    throw new Error(getErrorMessage(data, response.statusText));
  }

  return data as T;
}

export function getAuthSession(): Promise<AuthSessionResponse> {
  return authRequest<AuthSessionResponse>('auth/session');
}

export function loginWithGoogleCredential(credential: string): Promise<AuthSessionResponse> {
  return authRequest<AuthSessionResponse>('auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export function logoutAuth(): Promise<AuthSessionResponse> {
  return authRequest<AuthSessionResponse>('auth/logout', {
    method: 'POST',
  });
}
