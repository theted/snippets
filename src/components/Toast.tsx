import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { gsap } from 'gsap';

type Props = {
  message: string;
  onDismiss: () => void;
  duration?: number;
};

const Toast: React.FC<Props> = ({ message, onDismiss, duration = 2400 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline();

    // Enter: slide up from below + fade in
    tl.fromTo(
      el,
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' },
    );

    // Hold, then exit
    tl.to(el, { opacity: 0, y: -10, scale: 0.97, duration: 0.4, ease: 'power2.in' }, `+=${duration / 1000}`);
    tl.call(onDismiss);

    return () => { tl.kill(); };
  }, [duration, onDismiss]);

  return ReactDOM.createPortal(
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '2.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        // Glass styling
        background: 'linear-gradient(135deg, oklch(0.22 0.028 254 / 0.72), oklch(0.18 0.022 255 / 0.82))',
        backdropFilter: 'blur(28px)',
        border: '1px solid oklch(0.48 0.06 248 / 0.32)',
        borderRadius: '9999px',
        boxShadow: '0 8px 40px oklch(0.05 0.015 250 / 0.52), inset 0 1px 0 oklch(0.8 0.1 230 / 0.18)',
        padding: '0.75rem 1.6rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        whiteSpace: 'nowrap',
      }}
    >
      {/* Top-edge shimmer */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: '1px',
          borderRadius: '9999px 9999px 0 0',
          background: 'linear-gradient(90deg, transparent, oklch(0.88 0.12 228 / 0.5), transparent)',
          pointerEvents: 'none',
        }}
      />
      <span style={{
        fontSize: '0.82rem',
        color: 'oklch(0.72 0.14 236)',
        lineHeight: 1,
        letterSpacing: '0.01em',
      }}>
        ✓
      </span>
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'oklch(0.78 0.04 250)',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {message}
      </span>
    </div>,
    document.body,
  );
};

export default Toast;
