/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

type Props = {
  name: string;
  placeholder?: string;
  onChange?: any;
  [key: string]: any;
}

const classes = 'bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal';

const Textarea: React.FC<Props> = (props) => (<textarea {...props} className={classes} />);

export default Textarea;
