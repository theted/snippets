import type { QueryClient } from '@tanstack/react-query';
import { snippetKeys } from '../../hooks/react-query';
import { formatNumber } from '../../utils/formatters';

export const SNIPPET_STALE_MS = 30 * 60_000;

export const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;

  return `${m}m ${s}s`;
};

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export const formatLines = (lineCount: number): string => formatNumber(lineCount);

export const formatCacheAge = (cachedAt: number | null | undefined): string => {
  if (!cachedAt) {
    return 'Cold';
  }

  const seconds = Math.floor((Date.now() - cachedAt) / 1000);
  const minutes = Math.floor(seconds / 60);

  if (minutes === 0) {
    return `${seconds}s ago`;
  }

  return `${minutes}m ${seconds % 60}s ago`;
};

export const getCachedQueryCount = (queryClient: QueryClient) =>
  queryClient
    .getQueryCache()
    .findAll({ predicate: (query) => query.state.status === 'success' }).length;

export const getLatestSnippetFetch = (queryClient: QueryClient) =>
  queryClient
    .getQueryCache()
    .findAll({ queryKey: snippetKeys.lists() })
    .reduce<number | null>((bestTimestamp, query) => {
      const updatedAt = query.state.dataUpdatedAt;

      return updatedAt && (!bestTimestamp || updatedAt > bestTimestamp)
        ? updatedAt
        : bestTimestamp;
    }, null);

export const getIsSnippetsFresh = (latestSnippetFetch: number | null) =>
  latestSnippetFetch === null
    ? null
    : Date.now() - latestSnippetFetch < SNIPPET_STALE_MS;

export const getRelativeUsagePercentage = (value: number, maxValue: number) =>
  maxValue > 0 ? Math.max(8, Math.round((value / maxValue) * 100)) : 0;

export const getMaxFourColumnGridClassName = (itemCount: number) => {
  if (itemCount <= 1) {
    return 'grid-cols-1';
  }

  if (itemCount === 2) {
    return 'grid-cols-1 sm:grid-cols-2';
  }

  if (itemCount === 3) {
    return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';
  }

  return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';
};
