import { useQuery } from '@tanstack/react-query';
import { get } from '../utils/api';

export type ServerStatus = {
  db: {
    totalSnippets: number;
    totalLanguages: number;
    totalLines: number;
    totalBytes: number;
    topLanguages: { language: string; count: number; totalBytes: number }[];
  };
  cache: { snippetCount: number; cachedAt: number | null };
  server: {
    version: string;
    deployedAt: string;
    uptimeSeconds: number;
    loadAverage1m: number | null;
    cpuCount: number;
    memoryRssBytes: number;
    heapUsedBytes: number;
  };
};

export const useServerStatus = () =>
  useQuery({
    queryKey: ['server-status'],
    queryFn: () => get<ServerStatus>('status'),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
