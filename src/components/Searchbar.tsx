import React, { useState, FC } from 'react';
import Textfield from './Textfield';

const classes = {
  searchbar: 'relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 backdrop-blur-2xl md:px-10 md:py-10 lg:px-12 lg:py-12',
  kicker: 'text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[var(--color-text-subtle)]',
  title: 'mt-3 font-[var(--font-display)] text-3xl font-[250] tracking-[-0.05em] text-[var(--color-text)] md:text-5xl',
  subtitle: 'max-w-xl text-sm leading-7 text-[var(--color-text-muted)] md:text-base',
  status: 'mt-5 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-subtle)]',
};

type Props = {
  onSearch: (value: string) => void;
}

const Searchbar: FC<Props> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const searchCallback = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className={classes.searchbar}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className={classes.kicker}>Curate The Archive</p>
          <h2 className={classes.title}>Find the exact fragment you need.</h2>
        </div>
        <p className={classes.subtitle}>
          Search across titles, descriptions, and code content.
          The shell stays dark and generous so the snippets themselves keep the attention.
        </p>
      </div>
      <div className="mt-8">
        <Textfield
          name="searchString"
          onChange={searchCallback}
          placeholder="Search snippets by title, description, or code"
          className="text-lg md:text-xl"
        />
      </div>
      <p className={classes.status}>
        {searchTerm ? `Filtering: ${searchTerm}` : 'Showing every saved snippet'}
      </p>
    </div>
  );
};

export default Searchbar;
