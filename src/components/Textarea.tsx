/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import cx from 'classnames';

type Props = React.ComponentPropsWithoutRef<'textarea'>;

const textareaClasses = 'block min-h-[13rem] max-h-[24rem] w-full appearance-none overflow-y-auto no-scrollbar bg-transparent px-5 py-4 text-base leading-8 text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none md:px-6 md:py-5 md:text-lg';

const wrapBase: React.CSSProperties = {
    position: 'relative',
    borderRadius: '1.6rem',
    backdropFilter: 'blur(16px)',
    transition: 'border-color 300ms ease-out, box-shadow 300ms ease-out',
};

const wrapIdle: React.CSSProperties = {
    ...wrapBase,
    background: 'oklch(0.18 0.022 254 / 0.22)',
    border: '1px solid oklch(0.48 0.06 248 / 0.28)',
    boxShadow: 'inset 0 1px 0 oklch(0.82 0.1 230 / 0.10)',
};

const wrapFocused: React.CSSProperties = {
    ...wrapBase,
    background: 'oklch(0.22 0.026 250 / 0.32)',
    border: '1px solid oklch(0.69 0.13 240 / 0.55)',
    boxShadow: [
        '0 0 0 3px oklch(0.72 0.14 236 / 0.14)',
        '0 0 28px oklch(0.52 0.24 238 / 0.12)',
        'inset 0 1px 0 oklch(0.82 0.1 230 / 0.18)',
    ].join(', '),
};

const Textarea: React.FC<Props> = ({ className, onFocus, onBlur, ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div style={focused ? wrapFocused : wrapIdle}>
            {/* Top-edge shimmer */}
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute', top: 0, left: '10%', right: '10%',
                    height: '1px', pointerEvents: 'none',
                    background: 'linear-gradient(90deg, transparent, oklch(0.82 0.1 230 / 0.22), transparent)',
                }}
            />
            <textarea
                {...props}
                className={cx(textareaClasses, className)}
                onFocus={(e) => { setFocused(true); onFocus?.(e); }}
                onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            />
        </div>
    );
};

export default Textarea;
