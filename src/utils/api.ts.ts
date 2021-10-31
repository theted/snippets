import { API_BASE } from '../config';

const defaultHeaders = () => ({ 'Content-Type': 'application/json' });

const fetchData = function (input: any, init?: any | undefined) {
  return fetch(input, init).then((response) => response.text().then((text) => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      const error = data.errors[0] || response.statusText;
      return Promise.reject(error);
    }

    return data;
  }));
};

export const get = async <T>(path: string): Promise<T> => {
  const url = `${API_BASE}/${path}`;
  const headers = defaultHeaders();

  return fetchData(url, { headers });
};

export const post = async <T>(path: string, data: any): Promise<T> => {
  const url = `${API_BASE}/${path}`;
  const headers = defaultHeaders();

  return fetchData(url, {
    headers,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const update = async <T>(path: string, data: any): Promise<T> => {
  console.log({ UPDATING: data });

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
  idKey: string = 'id',
): Promise<void> => {
  const url = `${API_BASE}/${entity}/${idKey}`;
  const headers = defaultHeaders();

  return fetchData(url, {
    method: 'DELETE',
    headers,
  });
};
