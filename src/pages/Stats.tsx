import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { GlassPanel, GlassPill } from 'glass-design-system';
import Icon from '../components/Icon';
import Kicker from '../components/Kicker';
import { SpinFigure } from '../components/Spinner';
import { useServerStatus } from '../hooks/useServerStatus';
import { formatByteSize, formatCountLabel, formatDecimal, formatNumber } from '../utils/formatters';
import StatsLanguageBreakdown from './stats/StatsLanguageBreakdown';
import StatsSectionPanel from './stats/StatsSectionPanel';
import StatsTile from './stats/StatsTile';
import StatsTileGrid from './stats/StatsTileGrid';
import {
  formatCacheAge,
  formatDate,
  formatLines,
  formatUptime,
  getCachedQueryCount,
  getIsSnippetsFresh,
  getLatestSnippetFetch,
} from './stats/statsUtils';

type StatItem = {
  kicker: string;
  value: ReactNode;
  label?: string;
};

const statsShellClassName =
  'relative z-1 mx-auto w-full max-w-[100rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]';

const renderStatItems = (items: StatItem[]) =>
  items.map((item) => <StatsTile key={item.kicker} {...item} />);

const Stats = () => {
  const { data: status, isPending, isError } = useServerStatus();
  const queryClient = useQueryClient();
  const cachedQueryCount = getCachedQueryCount(queryClient);
  const latestSnippetFetch = getLatestSnippetFetch(queryClient);
  const isSnippetsFresh = getIsSnippetsFresh(latestSnippetFetch);

  const clientCacheItems: StatItem[] = [
    {
      kicker: 'Queries',
      value: formatNumber(cachedQueryCount),
      // label: 'successful entries cached',
    },
    {
      kicker: 'Snippets',
      value: (
        <span className={latestSnippetFetch ? '' : 'text-[var(--color-text-subtle)]'}>
          {formatCacheAge(latestSnippetFetch)}
        </span>
      ),
      // label: latestSnippetFetch ? 'since last fetch' : 'not yet loaded',
    },
    {
      kicker: 'Freshness',
      value: (
        <span className={isSnippetsFresh === null ? 'text-[var(--color-text-subtle)]' : ''}>
          {isSnippetsFresh === null ? '—' : isSnippetsFresh ? 'Fresh' : 'Stale'}
        </span>
      ),
      // label:
      //   isSnippetsFresh === true
      //     ? 'within 30 min window'
      //     : isSnippetsFresh === false
      //       ? 'refetches on next visit'
      //       : 'browse snippets first',
    },
  ];

  const libraryItems: StatItem[] = status
    ? [
        {
          kicker: 'Snippets',
          value: formatNumber(status.db.totalSnippets),
          // label: 'total in database',
        },
        {
          kicker: 'Languages',
          value: formatNumber(status.db.totalLanguages),
          // label: 'distinct languages',
        },
        {
          kicker: 'Lines',
          value: formatLines(status.db.totalLines ?? 0),
          // label: 'lines stored',
        },
        {
          kicker: 'Size',
          value: formatByteSize(status.db.totalBytes ?? 0),
          // label: 'of code content',
        },
      ]
    : [];

  const serverCacheItems: StatItem[] = status
    ? [
        {
          kicker: 'In memory',
          value: formatNumber(status.cache.snippetCount),
          label: 'snippets cached server-side',
        },
        {
          kicker: 'Cache age',
          value: (
            <span className={status.cache.cachedAt ? '' : 'text-[var(--color-text-subtle)]'}>
              {formatCacheAge(status.cache.cachedAt)}
            </span>
          ),
          label: status.cache.cachedAt ? 'since last population' : 'cache is empty',
        },
      ]
    : [];

  const serverItems: StatItem[] = status
    ? [
        {
          kicker: 'Version',
          value: status.server.version,
          // label: 'current build',
        },
        {
          kicker: 'Deployed',
          value: (
            <span className="text-4xl md:text-5xl">{formatDate(status.server.deployedAt)}</span>
          ),
          // label: 'last deployment',
        },
        {
          kicker: 'Uptime',
          value: formatUptime(status.server.uptimeSeconds),
          // label: 'server has been running',
        },
        {
          kicker: 'Load',
          value: (
            <span className={status.server.loadAverage1m === null ? 'text-[var(--color-text-subtle)]' : ''}>
              {status.server.loadAverage1m === null
                ? '—'
                : formatDecimal(status.server.loadAverage1m, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
            </span>
          ),
          label:
            status.server.loadAverage1m === null
              ? 'not reported on this platform'
              : `1 min avg across ${formatCountLabel(status.server.cpuCount, 'core')}`,
        },
      ]
    : [];

  return (
    <div className="App">
      <div className={statsShellClassName}>
        <GlassPill as={Link} to="/" size="md">
          <Icon name="home" style={{ fontSize: '0.85em' }} />
          Back to archive
        </GlassPill>

        <header className="mt-12 md:mt-16">
          <Kicker>System</Kicker>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl font-[250] tracking-[-0.06em] text-[var(--color-text)] md:text-6xl lg:text-7xl text-bevel-strong">
            Status
          </h1>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Live metrics from the database, cache, and server.
          </p>
        </header>

        <div className="mt-12 flex flex-col gap-6 md:mt-16">
          {isPending ? (
            <GlassPanel
              intensity="strong"
              topGlow
              bottomGlow
              rounded="rounded-[2.4rem]"
              className="flex min-h-[30vh] items-center justify-center p-8 md:p-12"
            >
              <div className="relative z-10">
                <SpinFigure />
              </div>
            </GlassPanel>
          ) : isError ? (
            <GlassPanel
              intensity="strong"
              topGlow
              bottomGlow
              rounded="rounded-[2.4rem]"
              className="flex min-h-[30vh] flex-col items-center justify-center gap-4 p-8 text-center md:p-12"
            >
              <div className="relative z-10 flex flex-col items-center gap-4">
                <Icon name="close" className="text-3xl text-[var(--color-text-subtle)]" />
                <p className="text-[var(--color-text-muted)]">Could not reach the server.</p>
                <p className="text-sm text-[var(--color-text-subtle)]">
                  Make sure the API is running and try again.
                </p>
              </div>
            </GlassPanel>
          ) : (
            <>
              <StatsSectionPanel
                title="Library"
                description="Database-level snapshot of the archive, grouped into four headline metrics."
              >
                <StatsTileGrid itemCount={libraryItems.length}>
                  {renderStatItems(libraryItems)}
                </StatsTileGrid>
              </StatsSectionPanel>

              <StatsSectionPanel
                title="Server"
                description="Runtime and deployment details for the active API process."
              >
                <StatsTileGrid itemCount={serverItems.length}>
                  {renderStatItems(serverItems)}
                </StatsTileGrid>
              </StatsSectionPanel>

              <StatsSectionPanel
                title="Server Cache"
                description="Server-side snippet cache health and recency."
              >
                <StatsTileGrid itemCount={serverCacheItems.length}>
                  {renderStatItems(serverCacheItems)}
                </StatsTileGrid>
              </StatsSectionPanel>

              <StatsLanguageBreakdown languages={status.db.topLanguages ?? []} />
            </>
          )}

          <StatsSectionPanel
            title="Client Cache"
            description="React Query in-browser cache, independent of the server."
          >
            <StatsTileGrid itemCount={clientCacheItems.length}>
              {renderStatItems(clientCacheItems)}
            </StatsTileGrid>
          </StatsSectionPanel>
        </div>
      </div>
    </div>
  );
};

export default Stats;
