/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef, useEffect, forwardRef } from 'react';
import { gsap } from 'gsap';

type Props = {
  children: any;
  closeModal?: () => void;
  [key: string]: any;
}

const ANIMATION_DURATION = 700;

const classes = {
  container: 'w-full h-screen flex items-center justify-center align-center fixed top-10 z-20 opacity-0',
  content: '',
  bg: 'bg fixed top-0 left-0 bottom-0 right-0 z-10',
  close: '',
};

export const closeModalFunc = ({ modalRef, backgroundRef, closeModal }) => {
  gsap.to(modalRef.current, {
    opacity: 0,
  });
  gsap.to(backgroundRef.current, {
    background: 'rgba(0, 0, 0, 0)',
    delay: 0.2,
  });

  if (closeModal) {
    setTimeout(() => {
      closeModal();
    }, ANIMATION_DURATION);
  }
};

const entryAnimation = ({ modalRef, backgroundRef }) => {
  gsap.to(modalRef.current, {
    opacity: 1,
    duration: 0.5,
    delay: 0.2,
  });
  gsap.to(backgroundRef.current, {
    background: 'rgba(0, 0, 0, 0.7)',
  });
};

const Modal: React.FC<Props> = ({ closeModal, children }) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeModalCallback = () => closeModalFunc({ modalRef, backgroundRef, closeModal });

  useEffect(() => {
    entryAnimation({ modalRef, backgroundRef });
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', (e) => {
      // eslint-disable-next-line no-unused-expressions
      e.key === 'Escape' && closeModalCallback();
    });
    return () => {
      document.removeEventListener('keydown', (e) => e);
    };
  }, [closeModal]);

  return (
    <>
      <div
        ref={modalRef}
        className={classes.container}
        onClick={closeModalCallback}
      >
        <div className={classes.close}>
          <div className="right-0 p-3" onClick={closeModalCallback}>x</div>
        </div>
        <div className={classes.content} onClick={(event) => event.stopPropagation()}>
          {children}
        </div>
      </div>
      <div
        ref={backgroundRef}
        className={classes.bg}
        style={{ background: 'rgba(0, 0, 0, 0)' }}
        onClick={closeModalCallback}
      />
    </>
  );
};

export default Modal;
