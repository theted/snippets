/* eslint-disable react/require-default-props */
import React from 'react';

type Props = {
    children: any;
    title?: string;
}

const classes = {
  container: 'bg-white rounded p-6',
};

const Box: React.FC<Props> = ({ title, children }) => (
  <div className={classes.container}>
    {title && (<h4>{title}</h4>)}
    {children}
  </div>
);

export default Box;
