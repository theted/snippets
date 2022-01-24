import React, { FC } from 'react';

type SelectOption = {
  label: string;
  value: string | number;
}

type Props = {
  name: string;
  options: SelectOption[];
  onChange: any; // () => void;
  // value?: string | number;
  [key: string]: any;
}

const classes = {
  container: 'bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal',
};

const Dropdown: FC<Props> = ({ name, options, onChange }) => (
  <select name={name} className={classes.container} onChange={onChange}>
    {options.map(({ label, value }) => (<option key={`${label}-${value}`} value={value}>{label}</option>))}
  </select>
);

export default Dropdown;
