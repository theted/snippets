/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
import React, {
  PropsWithChildren, RefObject, useCallback, useEffect, useRef,
} from 'react';
import { gsap } from 'gsap';

type Props = PropsWithChildren<{
  closeModal?: () => void;
}>;

type ModalRefs = {
  modalRef: RefObject<HTMLDivElement | null>;
  backgroundRef: RefObject<HTMLDivElement | null>;
  closeModal?: () => void;
};

const ANIMATION_DURATION = 500;

const classes = {
  container: 'fixed inset-0 z-30 flex items-center justify-center p-4 opacity-0 md:p-8',
  content: 'relative z-30 w-full max-w-5xl',
  bg: 'fixed inset-0 z-20',
  close: 'absolute right-5 top-5 z-40 inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
};

export const closeModalFunc = ({ modalRef, backgroundRef, closeModal }: ModalRefs) => {
  if (modalRef.current) {
    gsap.to(modalRef.current, {
      opacity: 0,
      y: 32,
      duration: 0.4,
      ease: 'power3.in',
    });
  }

  if (backgroundRef.current) {
    gsap.to(backgroundRef.current, {
      background: 'oklch(0.12 0.012 258 / 0)',
      duration: 0.4,
    });
  }

  if (closeModal) {
    setTimeout(() => {
      closeModal();
    }, ANIMATION_DURATION);
  }
};

const entryAnimation = ({ modalRef, backgroundRef }: Omit<ModalRefs, 'closeModal'>) => {
  if (modalRef.current) {
    gsap.to(modalRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
    });
  }

  if (backgroundRef.current) {
    gsap.to(backgroundRef.current, {
      background: 'oklch(0.12 0.012 258 / 0.78)',
      duration: 0.4,
    });
  }
};

const Modal: React.FC<Props> = ({ closeModal, children }) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeModalCallback = useCallback(() => {
    closeModalFunc({ modalRef, backgroundRef, closeModal });
  }, [closeModal]);

  useEffect(() => {
    entryAnimation({ modalRef, backgroundRef });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModalCallback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModalCallback]);

  return (
    <>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={classes.container}
        style={{ transform: 'translateY(40px)' }}
        onClick={closeModalCallback}
      >
        <div className={classes.content} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className={classes.close}
            onClick={closeModalCallback}
            aria-label="Close modal"
          >
            Close
          </button>
          {children}
        </div>
      </div>
      <div
        ref={backgroundRef}
        className={classes.bg}
        style={{ background: 'oklch(0.12 0.012 258 / 0)' }}
        onClick={closeModalCallback}
      />
    </>
  );
};

export default Modal;
