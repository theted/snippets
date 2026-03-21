import { useQuery } from '@tanstack/react-query';
import { get } from '../utils/api.ts';

export type ServerStatus = {
  db: { totalSnippets: number; totalLanguages: number };
  cache: { snippetCount: number };
  server: { version: string; deployedAt: string; uptimeSeconds: number };
};

export const useServerStatus = () =>
  useQuery({
    queryKey: ['server-status'],
    queryFn: () => get<ServerStatus>('status'),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
