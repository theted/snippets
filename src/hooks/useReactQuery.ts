import { useSnippets } from './react-query';

export default function useReactQuery(searchQuery: string) {
  return useSnippets(searchQuery);
}
