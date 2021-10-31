import React from 'react';

type Props = {
  name: string;
}

const classes = 'bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal';

// eslint-disable-next-line react/jsx-props-no-spreading
const Textfield: React.FC<Props> = (props) => (<input {...props} className={classes} />);

export default Textfield;
