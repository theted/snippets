import type { CSSProperties } from 'react';
import Snippet from '../../components/Snippet';
import type { Snippet as SnippetRecord, SnippetId } from '../../types';

type Props = {
  snippet: SnippetRecord;
  compact: boolean;
  theme: string;
  isFavorite: boolean;
  onDelete: (id: SnippetId) => void;
  onEdit: (id: SnippetId) => void;
  onToggleFavorite: (id: SnippetId) => void;
  onFilterLanguage: (language: string) => void;
  prefetch: (id: SnippetId) => void;
  className?: string;
  style?: CSSProperties;
  wrapperRef?: (element: HTMLDivElement | null) => void;
};

const SnippetCard = ({
  snippet,
  compact,
  theme,
  isFavorite,
  onDelete,
  onEdit,
  onToggleFavorite,
  onFilterLanguage,
  prefetch,
  className,
  style,
  wrapperRef,
}: Props) => (
  <div
    ref={wrapperRef}
    className={className}
    style={style}
    onMouseEnter={() => prefetch(snippet.id)}
  >
    <Snippet
      id={snippet.id}
      title={snippet.title}
      description={snippet.description}
      content={snippet.content}
      language={snippet.language}
      onDelete={onDelete}
      onEdit={onEdit}
      theme={theme}
      compact={compact}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onFilterLanguage={onFilterLanguage}
    />
  </div>
);

export default SnippetCard;
