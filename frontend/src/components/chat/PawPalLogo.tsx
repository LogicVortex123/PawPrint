import React, { useId } from 'react';

/**
 * PawPal's mascot: a puppy face (honey floppy ears, a beagle patch, sparkly
 * eyes) inside an emerald chat bubble. `animated` makes it blink now and then
 * and wag its ears when a parent `.group` is hovered. `outlined` adds a white
 * rim so it stands out on dark green surfaces.
 */
export const PawPalLogo: React.FC<{ className?: string; animated?: boolean; outlined?: boolean; title?: string }> = ({
  className = 'w-8 h-8',
  animated = false,
  outlined = false,
  title,
}) => {
  // Unique gradient ids so several logos on one page never share (or lose) a definition
  const id = useId().replace(/:/g, '');
  const bubble = `pp-bubble-${id}`;
  const shine = `pp-shine-${id}`;
  const ear = `pp-ear-${id}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} flex-shrink-0 overflow-visible ${animated ? 'pawpal-animated' : ''}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={bubble} x1="8" y1="4" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3FD69F" />
          <stop offset="0.55" stopColor="#1F8A66" />
          <stop offset="1" stopColor="#14503D" />
        </linearGradient>
        <radialGradient id={shine} cx="18" cy="12" r="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ear} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6C76A" />
          <stop offset="1" stopColor="#D9912C" />
        </linearGradient>
      </defs>

      {/* Chat bubble with a tail at the bottom left */}
      <path
        d="M22 4h20a18 18 0 0 1 18 18v12a18 18 0 0 1-18 18H25.5l-9.8 7.6c-.9.7-2.1-.1-1.9-1.2l1.3-7.6A18 18 0 0 1 4 34V22A18 18 0 0 1 22 4z"
        fill={`url(#${bubble})`}
        stroke={outlined ? 'rgba(255,255,255,0.9)' : 'none'}
        strokeWidth={outlined ? 2.5 : 0}
      />
      <path d="M22 4h20a18 18 0 0 1 18 18v12a18 18 0 0 1-18 18H22A18 18 0 0 1 4 34V22A18 18 0 0 1 22 4z" fill={`url(#${shine})`} />

      {/* The face, a little larger than drawn so it reads at avatar sizes */}
      <g transform="translate(32 29) scale(1.18) translate(-32 -29)">
      {/* Floppy ears (behind the face) */}
      <g className="pawpal-ear-left">
        <path d="M21.5 17.5c-4.6-.6-8.4 3-8.6 8.6-.2 4.4 1.4 8.4 4.4 9.6 2.2.9 3.8-1 4.4-4.2l1.9-9.6c.5-2.5-.1-4.1-2.1-4.4z" fill={`url(#${ear})`} />
      </g>
      <g className="pawpal-ear-right">
        <path d="M42.5 17.5c4.6-.6 8.4 3 8.6 8.6.2 4.4-1.4 8.4-4.4 9.6-2.2.9-3.8-1-4.4-4.2l-1.9-9.6c-.5-2.5.1-4.1 2.1-4.4z" fill={`url(#${ear})`} />
      </g>

      {/* Face */}
      <ellipse cx="32" cy="29.5" rx="12.5" ry="12" fill="#FFFDF7" />
      {/* Beagle patch over one eye, and a soft muzzle */}
      <path d="M36.5 18.4c3.8.6 6.6 3.6 7.4 7.4.3 1.6-.8 2.8-2.4 2.8-3 0-5.8-2.2-6.6-5.2l-.5-2.2c-.4-1.6.6-3 2.1-2.8z" fill="#F2B84B" opacity="0.9" />
      <ellipse cx="32" cy="34.6" rx="6.6" ry="5" fill="#F6EBD9" />

      {/* Eyes, with highlights; they blink together when animated */}
      <g className="pawpal-eyes">
        <ellipse cx="26.6" cy="28" rx="2.15" ry="2.5" fill="#1C2B29" />
        <ellipse cx="37.4" cy="28" rx="2.15" ry="2.5" fill="#1C2B29" />
        <circle cx="25.9" cy="27.1" r="0.8" fill="#FFFFFF" />
        <circle cx="36.7" cy="27.1" r="0.8" fill="#FFFFFF" />
      </g>

      {/* Nose, smile and rosy cheeks */}
      <path d="M29.6 32.2c0-.9.7-1.4 2.4-1.4s2.4.5 2.4 1.4c0 1.1-1.3 2.2-2.4 2.2s-2.4-1.1-2.4-2.2z" fill="#1C2B29" />
      <path d="M32 34.4v1.2m0 0c-.6 1.2-1.7 1.7-2.9 1.3M32 35.6c.6 1.2 1.7 1.7 2.9 1.3" stroke="#1C2B29" strokeWidth="1.15" strokeLinecap="round" fill="none" />
      <ellipse cx="22.6" cy="33" rx="2.1" ry="1.3" fill="#F0705A" opacity="0.45" />
      <ellipse cx="41.4" cy="33" rx="2.1" ry="1.3" fill="#F0705A" opacity="0.45" />
      </g>

      {/* Little sparkle — PawPal is the "smart" one */}
      <path className="pawpal-sparkle" d="M53 6.5l1.3 3.2 3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.3z" fill="#FCEFD3" />
    </svg>
  );
};
