import React, { useState, FC } from 'react';
import Textfield from './Textfield';

const classes = {
  searchbar: 'text-2xl m-4 p-8',
};

type Props = {
  onSearch: () => void;
}

const Searchbar: FC<Props> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const searchCallback = (event) => {
    const { target: { value } } = event;
    setSearchTerm(value);
    onSearch(value);
    // TODO: update browser url?
  };

  return (
    <div className={classes.searchbar}>
      <Textfield name="searchString" onChange={searchCallback} placeholder="Search" />
      <p className="py-4 text-white">
        Search:
        {' '}
        {searchTerm}
      </p>
    </div>
  );
};

export default Searchbar;
