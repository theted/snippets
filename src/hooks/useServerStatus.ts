import { useQuery } from '@tanstack/react-query';
import { get } from '../utils/api.ts';

export type ServerStatus = {
  db: {
    totalSnippets: number;
    totalLanguages: number;
    totalLines: number;
    totalCharacters: number;
    topLanguages: { language: string; count: number }[];
  };
  cache: { snippetCount: number; cachedAt: number | null };
  server: { version: string; deployedAt: string; uptimeSeconds: number };
};

export const useServerStatus = () =>
  useQuery({
    queryKey: ['server-status'],
    queryFn: () => get<ServerStatus>('status'),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
