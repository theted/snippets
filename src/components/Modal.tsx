/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
import React, {
  PropsWithChildren, RefObject, useCallback, useEffect, useRef,
} from 'react';
import ReactDOM from 'react-dom';
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
  // overflow-y-auto lets tall forms (edit/create) scroll inside the overlay
  // without moving the page behind it. The GSAP opacity+y tween runs on this
  // element so the whole thing fades+slides as one unit.
  container: 'fixed inset-0 z-30 overflow-y-auto opacity-0',
  // Inner wrapper centres content and acts as the click-outside target
  inner: 'flex min-h-full items-center justify-center p-4 md:p-8',
  content: 'relative w-full max-w-6xl',
  bg: 'fixed inset-0 z-20',
  close: 'absolute right-4 top-4 z-40 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-muted)] backdrop-blur-sm transition duration-300 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]',
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
      background: 'oklch(0.10 0.012 258 / 0)',
      backdropFilter: 'blur(0px)',
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
      background: 'oklch(0.10 0.012 258 / 0.60)',
      backdropFilter: 'blur(10px)',
      duration: 0.5,
      ease: 'power2.out',
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
    document.body.classList.add('dialog-open');
    entryAnimation({ modalRef, backgroundRef });
    return () => { document.body.classList.remove('dialog-open'); };
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

  return ReactDOM.createPortal(
    <>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={classes.container}
        style={{ transform: 'translateY(40px)' }}
      >
        {/* Click-outside target — stopPropagation on the card prevents bubbling */}
        <div className={classes.inner} onClick={closeModalCallback}>
          <div className={classes.content} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className={classes.close}
              onClick={closeModalCallback}
              aria-label="Close modal"
            >
              <i className="icon-cancel" style={{ fontSize: '0.8em' }} />
              Close
            </button>
            {children}
          </div>
        </div>
      </div>
      <div
        ref={backgroundRef}
        className={classes.bg}
        style={{ background: 'oklch(0.10 0.012 258 / 0)', backdropFilter: 'blur(0px)' }}
      />
    </>,
    document.body,
  );
};

export default Modal;
