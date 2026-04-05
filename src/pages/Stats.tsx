import React from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { GlassPill, GlassPanel, GlassDivider } from 'glass-design-system';
import Icon from '../components/Icon';
import Kicker from '../components/Kicker';
import { SpinFigure } from '../components/Spinner';
import { useServerStatus } from '../hooks/useServerStatus';
import { snippetKeys } from '../hooks/react-query';
import { capitalize } from '../utils/helpers';

const formatUptime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
 

const formatLines = (n: number): string => n.toLocaleString();

const formatSize = (bytes: number): string => {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${bytes} B`;
};

const formatCacheAge = (cachedAt: number | null | undefined): string => {
  if (!cachedAt) return 'Cold';
  const s = Math.floor((Date.now() - cachedAt) / 1000);
  const m = Math.floor(s / 60);
  if (m === 0) return `${s}s ago`;
  return `${m}m ${s % 60}s ago`;
};

type StatTileProps = {
  kicker: string;
  value: React.ReactNode;
  label: string;
};

const StatTile: React.FC<StatTileProps> = ({ kicker, value, label }) => (
  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.8rem]" className="p-6 md:p-8">
    <div className="relative z-10 flex flex-col gap-2">
      <Kicker className="tracking-[0.28em]">{kicker}</Kicker>
      <div className="mt-3 font-[var(--font-display)] text-5xl font-[200] tracking-[-0.05em] text-[var(--color-text)] [text-shadow:0_1px_0_oklch(1_0_0_/_0.12),0_2px_16px_oklch(0_0_0_/_0.28)] md:text-6xl">
        {value}
      </div>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  </GlassPanel>
);

const SNIPPET_STALE_MS = 30 * 60_000;

const Stats: React.FC = () => {
  const { data: status, isPending, isError } = useServerStatus();
  const queryClient = useQueryClient();

  const allSuccessQueries = queryClient
    .getQueryCache()
    .findAll({ predicate: (q) => q.state.status === 'success' });
  const cachedQueryCount = allSuccessQueries.length;

  const snippetListQueries = queryClient.getQueryCache().findAll({ queryKey: snippetKeys.lists() });
  const latestSnippetFetch =
    snippetListQueries.reduce<number | null>((best, q) => {
      const t = q.state.dataUpdatedAt;
      return t && (!best || t > best) ? t : best;
    }, null) || null;

  const isSnippetsFresh = latestSnippetFetch
    ? Date.now() - latestSnippetFetch < SNIPPET_STALE_MS
    : null;

  return (
    <div className="App">
      <div className="relative z-1 mx-auto w-full max-w-[100rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]">
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

        <div className="mt-12 md:mt-16">
          {isPending ? (
            <div className="flex min-h-[30vh] items-center justify-center">
              <SpinFigure />
            </div>
          ) : isError ? (
            <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
              <Icon name="close" className="text-3xl text-[var(--color-text-subtle)]" />
              <p className="text-[var(--color-text-muted)]">Could not reach the server.</p>
              <p className="text-sm text-[var(--color-text-subtle)]">
                Make sure the API is running and try again.
              </p>
            </div>
          ) : (
            <GlassPanel
              intensity="strong"
              topGlow
              bottomGlow
              rounded="rounded-[2.4rem]"
              className="p-8 md:p-12"
            >
              <div className="relative z-10">
                {/* Library */}
                <section>
                  <Kicker>Library</Kicker>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatTile
                      kicker="Snippets"
                      value={status.db.totalSnippets}
                      label="total in database"
                    />
                    <StatTile
                      kicker="Languages"
                      value={status.db.totalLanguages}
                      label="distinct languages"
                    />
                    <StatTile
                      kicker="Lines"
                      value={formatLines(status.db.totalLines ?? 0)}
                      label="lines stored"
                    />
                    <StatTile
                      kicker="Size"
                      value={formatSize(status.db.totalCharacters ?? 0)}
                      label="of code content"
                    />
                  </div>
                </section>

                <GlassDivider className="my-8" />

                {/* Languages */}
                <section>
                  <Kicker>Languages</Kicker>
                  <GlassPanel
                    intensity="subtle"
                    topGlow={false}
                    rounded="rounded-[1.8rem]"
                    className="mt-6 p-6 md:p-8"
                  >
                    <div className="relative z-10 flex flex-col gap-4">
                      {(status.db.topLanguages ?? []).map((lang, i) => {
                        const pct =
                          status.db.totalSnippets > 0
                            ? Math.round((lang.count / status.db.totalSnippets) * 100)
                            : 0;
                        return (
                          <div key={lang.language} className="flex items-center gap-4">
                            <span className="w-5 shrink-0 text-xs tabular-nums text-[var(--color-text-subtle)]">
                              {i + 1}
                            </span>
                            <span className="w-28 shrink-0 text-sm text-[var(--color-text)]">
                              {capitalize(lang.language)}
                            </span>
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-glass-row)]">
                              <div
                                className="h-full rounded-full bg-[var(--color-accent)]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 shrink-0 text-right text-sm tabular-nums text-[var(--color-text)]">
                              {lang.count}
                            </span>
                            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-[var(--color-text-subtle)]">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </GlassPanel>
                </section>

                <GlassDivider className="my-8" />

                {/* Cache */}
                <section>
                  <Kicker>Cache</Kicker>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:max-w-xl">
                    <StatTile
                      kicker="In memory"
                      value={status.cache.snippetCount}
                      label="snippets cached server-side"
                    />
                    <StatTile
                      kicker="Cache age"
                      value={
                        <span
                          className={status.cache.cachedAt ? '' : 'text-[var(--color-text-subtle)]'}
                        >
                          {formatCacheAge(status.cache.cachedAt)}
                        </span>
                      }
                      label={status.cache.cachedAt ? 'since last population' : 'cache is empty'}
                    />
                  </div>
                </section>

                <GlassDivider className="my-8" />

                {/* Server */}
                <section>
                  <Kicker>Server</Kicker>
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatTile
                      kicker="Version"
                      value={status.server.version}
                      label="current build"
                    />
                    <StatTile
                      kicker="Deployed"
                      value={
                        <span className="text-4xl md:text-5xl">
                          {formatDate(status.server.deployedAt)}
                        </span>
                      }
                      label="last deployment"
                    />
                    <StatTile
                      kicker="Uptime"
                      value={formatUptime(status.server.uptimeSeconds)}
                      label="server has been running"
                    />
                  </div>
                </section>
              </div>
            </GlassPanel>
          )}
        </div>

        {/* Client Cache — always rendered, outside the server-data conditional */}
        <div className="mt-6">
          <GlassPanel
            intensity="strong"
            topGlow
            bottomGlow
            rounded="rounded-[2.4rem]"
            className="p-8 md:p-12"
          >
            <div className="relative z-10">
              <section>
                <Kicker>Client Cache</Kicker>
                <p className="mt-2 text-sm text-[var(--color-text-subtle)]">
                  React Query in-browser cache — independent of the server.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:max-w-xl sm:grid-cols-3">
                  <StatTile
                    kicker="Queries"
                    value={cachedQueryCount}
                    label="successful entries cached"
                  />
                  <StatTile
                    kicker="Snippets"
                    value={
                      <span className={latestSnippetFetch ? '' : 'text-[var(--color-text-subtle)]'}>
                        {formatCacheAge(latestSnippetFetch)}
                      </span>
                    }
                    label={latestSnippetFetch ? 'since last fetch' : 'not yet loaded'}
                  />
                  <StatTile
                    kicker="Freshness"
                    value={
                      <span
                        className={
                          isSnippetsFresh === null ? 'text-[var(--color-text-subtle)]' : ''
                        }
                      >
                        {isSnippetsFresh === null ? '—' : isSnippetsFresh ? 'Fresh' : 'Stale'}
                      </span>
                    }
                    label={
                      isSnippetsFresh === true
                        ? 'within 30 min window'
                        : isSnippetsFresh === false
                          ? 'refetches on next visit'
                          : 'browse snippets first'
                    }
                  />
                </div>
              </section>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
};

export default Stats;
