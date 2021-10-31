/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

type Props = {
  closeModal: () => void;
  children: any;
}

const classes = {
  container: 'main-modal w-full h-screen flex items-center justify-center align-center fixed top-0 z-20',
  bg: 'bg fixed top-0 left-0 bottom-0 right-0 z-10 animated fadeIn',
};

const Modal: React.FC<Props> = ({ closeModal, children }) => (
  <>
    <div className={classes.container}>
      {children}
    </div>
    <div
      className={classes.bg}
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={closeModal}
    />
  </>
);

export default Modal;
