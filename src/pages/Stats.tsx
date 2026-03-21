import React from 'react';
import { Link } from 'react-router-dom';
import { GlassPill, GlassPanel, GlassDivider } from 'glass-design-system';
import Icon from '../components/Icon';
import Kicker from '../components/Kicker';
import { SpinFigure } from '../components/Spinner';
import { useServerStatus } from '../hooks/useServerStatus';

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

type StatTileProps = {
  kicker: string;
  value: React.ReactNode;
  label: string;
};

// GlassPanel gives this `position: relative`, ensuring it paints above the
// parent panel's absolutely-positioned light-wash overlay (prevents hover leak).
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

const Stats: React.FC = () => {
  const { data: status, isPending, isError } = useServerStatus();

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
            <GlassPanel intensity="strong" topGlow bottomGlow rounded="rounded-[2.4rem]" className="p-8 md:p-12">
              <div className="relative z-10">

              {/* Database */}
              <section>
                <Kicker>Database</Kicker>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:max-w-xl">
                  <StatTile kicker="Snippets"   value={status.db.totalSnippets}  label="total in database"   />
                  <StatTile kicker="Languages"  value={status.db.totalLanguages} label="distinct languages"  />
                </div>
              </section>

              <GlassDivider className="my-8" />

              {/* Cache */}
              <section>
                <Kicker>Cache</Kicker>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:max-w-xl">
                  <StatTile kicker="In memory" value={status.cache.snippetCount} label="snippets cached server-side" />
                  <GlassPanel intensity="subtle" topGlow={false} rounded="rounded-[1.8rem]" className="p-6 md:p-8">
                    <div className="relative z-10 flex flex-col justify-center gap-2">
                      <Kicker className="tracking-[0.28em]">TTL</Kicker>
                      <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
                        The unfiltered snippet list is cached server-side for 10 minutes.
                        Any write operation clears it immediately.
                      </p>
                    </div>
                  </GlassPanel>
                </div>
              </section>

              <GlassDivider className="my-8" />

              {/* Server */}
              <section>
                <Kicker>Server</Kicker>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatTile kicker="Version"  value={status.server.version} label="current build" />
                  <StatTile
                    kicker="Deployed"
                    value={<span className="text-4xl md:text-5xl">{formatDate(status.server.deployedAt)}</span>}
                    label="last deployment"
                  />
                  <StatTile kicker="Uptime" value={formatUptime(status.server.uptimeSeconds)} label="server has been running" />
                </div>
              </section>

              </div>
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
