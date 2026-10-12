import { useMemo } from 'react';
import type { Snippet } from '../../types';
import { buildCodeColumns } from './codeBackdrop';

// Wide screens show all four; CSS drops columns as the viewport narrows.
const COLUMN_COUNT = 4;
const LINES_PER_COLUMN = 40;

type Props = {
  snippets: Snippet[];
};

/** The archive's own code behind the hero glass: frosted under the pane, dim outside it. */
const CodeBackdrop = ({ snippets }: Props) => {
  const columns = useMemo(
    () => buildCodeColumns(snippets, COLUMN_COUNT, LINES_PER_COLUMN),
    [snippets],
  );

  if (columns[0].length === 0) return null;

  return (
    <div className="code-backdrop" aria-hidden="true">
      {columns.map((lines, index) => (
        // Columns never reorder, so the index is a stable key.
        // eslint-disable-next-line react/no-array-index-key
        <pre key={index} className="code-backdrop__column">{lines.join('\n')}</pre>
      ))}
    </div>
  );
};

export default CodeBackdrop;
