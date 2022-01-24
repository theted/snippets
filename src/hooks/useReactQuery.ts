import { useQuery } from 'react-query';
import axios from 'axios';
import { API_BASE } from '../config';

export type QueryResponse = {
  [key: string]: string
};

const getSearchUrl = (q = '') => `${API_BASE}/snippets?q=${q}&_sort=id&_order=desc`;

const guerySnippets = async (
  searchQuery: any,
): Promise<QueryResponse> => {
  const { data } = await axios.get(getSearchUrl(searchQuery.queryKey[1]));
  return data;
};

export default function useReactQuery(searchQuery: string) {
  // ! TODO: fix !
  if (searchQuery.length) {
    // eslint-disable-next-line no-console
    console.log({ searchQuery });
  }

  // return useQuery<QueryResponse, Error>(['snippets', searchQuery], guerySnippets, {
  //   enabled: true,
  // });
  return useQuery<QueryResponse, Error>(['snippets'], guerySnippets, {
    enabled: true,
  });
}
