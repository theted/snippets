import { useSnippets, SnippetQueryParams } from './react-query';

export default function useReactQuery(params: SnippetQueryParams) {
  return useSnippets(params);
}
