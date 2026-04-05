import { GlassPanel } from 'glass-design-system';
import { formatByteSize, formatCountLabel } from '../../utils/formatters';
import { getLanguageLabel } from '../../utils/language';
import StatsSectionPanel from './StatsSectionPanel';
import { getRelativeUsagePercentage } from './statsUtils';

type LanguageStat = {
  language: string;
  count: number;
  totalBytes: number;
};

type Props = {
  languages: LanguageStat[];
  className?: string;
};

const getMaxLanguageBytes = (languages: LanguageStat[]) =>
  Math.max(...languages.map(({ totalBytes }) => totalBytes), 0);

const StatsLanguageBreakdown = ({ languages, className = '' }: Props) => {
  const maxBytes = getMaxLanguageBytes(languages);

  return (
    <StatsSectionPanel
      title="Languages"
      description="Stored size per language, shown as a dense ranked list."
      className={className}
    >
      {languages.length === 0 ? (
        <p className="text-sm text-[var(--color-text-subtle)]">
          No language data is available yet.
        </p>
      ) : (
        <GlassPanel
          intensity="subtle"
          topGlow={false}
          rounded="rounded-[1.8rem]"
          className="p-4 md:p-5"
        >
          <div className="relative z-10 flex flex-col">
            {languages.map((language, index) => {
              const relativeUsage = getRelativeUsagePercentage(language.totalBytes, maxBytes);

              return (
                <div
                  key={language.language}
                  className={[
                    'flex items-center gap-3 py-3',
                    index > 0 ? 'border-t border-[var(--color-border)]' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="w-8 shrink-0 text-xs tabular-nums text-[var(--color-text-subtle)]">
                    #{index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm text-[var(--color-text)] md:text-base">
                        {getLanguageLabel(language.language)}
                      </span>
                      <div className="flex shrink-0 items-baseline gap-3">
                        <span className="text-right text-sm tabular-nums text-[var(--color-text-muted)]">
                          {formatCountLabel(language.count, 'snippet')}
                        </span>
                        <span className="text-right text-sm tabular-nums text-[var(--color-text)]">
                          {formatByteSize(language.totalBytes)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-glass-row)]">
                      <div
                        className="h-full rounded-full bg-[var(--color-accent)]"
                        style={{ width: `${relativeUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      )}
    </StatsSectionPanel>
  );
};

export default StatsLanguageBreakdown;
