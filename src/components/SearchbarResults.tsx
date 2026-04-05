import type { KeyboardEvent, MutableRefObject } from 'react';
import { Link } from 'react-router-dom';
import { SpinFigure } from './Spinner';
import { capitalize } from '../utils/helpers';
import { RESULTS_LIMIT, type SearchbarResult } from './searchbarContent';

type Props = {
  results: SearchbarResult[];
  isLoadingResults: boolean;
  isSearching: boolean;
  debouncedQuery: string;
  resultRefs: MutableRefObject<(HTMLAnchorElement | null)[]>;
  onResultKeyDown: (event: KeyboardEvent<HTMLAnchorElement>, index: number) => void;
};

const SearchbarResults = ({
  results,
  isLoadingResults,
  isSearching,
  debouncedQuery,
  resultRefs,
  onResultKeyDown,
}: Props) => (
  <div className={`relative z-10 search-results-wrap${isSearching ? ' open' : ''}`}>
    <div>
      {isSearching &&
        (isLoadingResults ? (
          <div className="flex items-center justify-center py-6">
            <SpinFigure />
          </div>
        ) : results.length === 0 ? (
          <p className="search-results-status">No snippets matched &ldquo;{debouncedQuery}&rdquo;</p>
        ) : (
          <ul className="search-results-list" role="listbox" aria-label="Search results">
            {results.slice(0, RESULTS_LIMIT).map((snippet, index) => (
              <li key={snippet.id} className="search-result-item" role="option" aria-selected="false">
                <Link
                  to={`/snippets/${snippet.id}`}
                  ref={(element) => {
                    resultRefs.current[index] = element;
                  }}
                  className="search-result-link"
                  onKeyDown={(event) => onResultKeyDown(event, index)}
                  tabIndex={0}
                >
                  <span className="search-result-title">
                    {capitalize(snippet.title || 'Untitled snippet')}
                  </span>
                  <span className="search-result-lang">{snippet.language || 'plaintext'}</span>
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </div>
  </div>
);

export default SearchbarResults;
