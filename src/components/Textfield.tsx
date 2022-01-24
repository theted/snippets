/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

type Props = {
  name: string;
  onChange?: any;
  placeholder?: string;
  value?: string;
}

const classes = 'bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal';

const Textfield: React.FC<Props> = (props) => (<input {...props} className={classes} />);

export default Textfield;
