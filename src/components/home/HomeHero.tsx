import type { ReactNode } from 'react';
import { GlassPanel } from 'glass-design-system';
import { useSnippets } from '../../hooks/react-query';
import { formatCountLabel } from '../../utils/formatters';
import CodeBackdrop from './CodeBackdrop';

type Props = {
  action: ReactNode;
};

const HomeHero = ({ action }: Props) => {
  const { data: snippets = [] } = useSnippets({});
  const languageCount = new Set(snippets.map(({ language }) => language)).size;

  return (
    <section className="home-hero" aria-labelledby="home-title">
      <CodeBackdrop snippets={snippets} />

      <GlassPanel intensity="medium" reveal rounded="rounded-[2.4rem]" className="home-hero__pane">
        <div className="relative z-10">
          <h1 id="home-title" className="home-hero__title">Snippets</h1>
          <p className="home-hero__lede">A personal archive of code worth keeping.</p>
          {snippets.length > 0 && (
            <p className="home-hero__count">
              {formatCountLabel(snippets.length, 'snippet')} in {formatCountLabel(languageCount, 'language')}
            </p>
          )}
          <div className="home-hero__action">{action}</div>
        </div>
      </GlassPanel>
    </section>
  );
};

export default HomeHero;
