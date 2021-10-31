import { useQuery } from 'react-query';
import { get } from '../utils/api.ts';
import { Snippet } from '../types';

export const useSnippets = (query: string) => useQuery('snippets', async () => get<Snippet[]>(`snippets?q=${query}&_sort=id&_order=desc`));

export const useSnippet = (id: string) => useQuery(`snippets/${id}`, async () => get<Snippet>(`snippets/${id}`));
