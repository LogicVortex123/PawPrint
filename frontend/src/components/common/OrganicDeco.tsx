import React from 'react';

/**
 * Reusable presentational decorative components matching the PawPrint visual identity.
 * Visual-only, zero business logic.
 */

export const PawIcon: React.FC<{ className?: string; fill?: string }> = ({
  className = "w-6 h-6",
  fill = "currentColor",
}) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11.5c-1.66 0-3 1.34-3 3 0 1.25.75 2.32 1.83 2.76-.17.38-.83 1.24-1.83 1.24-1.1 0-2 .9-2 2s.9 2 2 2c2.5 0 4.2-1.85 4.88-3.23.08-.16.12-.34.12-.52 0-.25-.09-.48-.25-.66-.45-.51-.75-1.18-.75-1.92 0-.37.07-.72.2-1.04C12.78 12.02 12.41 11.5 12 11.5zM12 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4.5 1c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm9 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5.5 14c.83 0 1.5-.67 1.5-1.5S6.33 11 5.5 11 4 11.67 4 12.5 4.67 14 5.5 14zm13 0c.83 0 1.5-.67 1.5-1.5S19.33 11 18.5 11 17 11.67 17 12.5s.67 1.5 1.5 1.5z" />
  </svg>
);

export const PawPrintDecoration: React.FC<{
  className?: string;
  fill?: string;
  opacity?: number;
  rotation?: number;
}> = ({
  className = "w-10 h-10",
  fill = "currentColor",
  opacity = 0.15,
  rotation = 0,
}) => (
  <svg
    viewBox="0 0 40 40"
    className={className}
    style={{ transform: `rotate(${rotation}deg)`, opacity }}
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main central pad */}
    <path d="M20 20 C16 20 13 23 13 27 C13 31 16 34 20 34 C24 34 27 31 27 27 C27 23 24 20 20 20 Z" />
    {/* 4 toe pads */}
    <ellipse cx="12" cy="15" rx="3.2" ry="4.2" transform="rotate(-20 12 15)" />
    <ellipse cx="17.5" cy="11.5" rx="3.2" ry="4.2" transform="rotate(-8 17.5 11.5)" />
    <ellipse cx="23" cy="11.5" rx="3.2" ry="4.2" transform="rotate(8 23 11.5)" />
    <ellipse cx="28" cy="15" rx="3.2" ry="4.2" transform="rotate(20 28 15)" />
  </svg>
);

export const BotanicalBranch: React.FC<{
  className?: string;
  stemColor?: string;
  leafPrimary?: string;
  leafSecondary?: string;
}> = ({
  className = "w-36 h-48",
  stemColor = "#234D3C",
  leafPrimary = "#588874",
  leafSecondary = "#7EA995",
}) => (
  <svg viewBox="0 0 140 180" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Graceful curved stem */}
    <path
      d="M70 175 C68 135, 78 85, 115 25"
      stroke={stemColor}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* Paired botanical leaves with subtle two-tone shading */}
    {/* Leaf 1 (bottom left) */}
    <path d="M68 140 C42 135, 34 148, 42 162 C50 170, 65 158, 68 140 Z" fill={leafPrimary} />
    <path d="M42 162 C50 152, 60 146, 68 140" stroke={stemColor} strokeWidth="1" opacity="0.4" />

    {/* Leaf 2 (bottom right) */}
    <path d="M72 130 C96 120, 108 130, 102 144 C96 154, 80 146, 72 130 Z" fill={leafSecondary} />

    {/* Leaf 3 (mid left) */}
    <path d="M72 105 C48 95, 42 108, 50 120 C58 128, 70 118, 72 105 Z" fill={leafSecondary} />

    {/* Leaf 4 (mid right) */}
    <path d="M78 95 C102 82, 114 92, 108 106 C102 116, 86 108, 78 95 Z" fill={leafPrimary} />

    {/* Leaf 5 (upper left) */}
    <path d="M85 70 C65 58, 60 70, 68 80 C75 88, 84 80, 85 70 Z" fill={leafPrimary} />

    {/* Leaf 6 (upper right) */}
    <path d="M92 60 C112 48, 122 56, 116 68 C110 76, 98 70, 92 60 Z" fill={leafSecondary} />

    {/* Terminal leaf at tip */}
    <path d="M115 25 C125 12, 134 20, 128 32 C122 38, 116 32, 115 25 Z" fill={leafPrimary} />
  </svg>
);

export const BotanicalSprig: React.FC<{
  className?: string;
  color?: string;
}> = ({
  className = "w-20 h-28",
  color = "#588874",
}) => (
  <svg viewBox="0 0 80 110" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 105 C38 75, 48 45, 66 15" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M40 82 C22 75, 18 86, 24 94 C30 100, 38 92, 40 82 Z" fill={color} fillOpacity="0.85" />
    <path d="M42 70 C58 60, 66 68, 62 76 C56 82, 48 76, 42 70 Z" fill={color} fillOpacity="0.7" />
    <path d="M46 48 C32 40, 28 50, 34 58 C40 64, 46 56, 46 48 Z" fill={color} fillOpacity="0.85" />
    <path d="M52 35 C66 25, 72 32, 68 40 C64 46, 56 42, 52 35 Z" fill={color} fillOpacity="0.7" />
    <path d="M66 15 C72 6, 78 12, 74 18 C70 22, 66 18, 66 15 Z" fill={color} />
  </svg>
);

export const HandDrawnSwoosh: React.FC<{
  className?: string;
  strokeColor?: string;
}> = ({
  className = "w-48 h-4",
  strokeColor = "currentColor",
}) => (
  <svg viewBox="0 0 220 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 11 C45 3, 110 4, 180 8 C195 9, 212 11, 216 12"
      stroke={strokeColor}
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

export const HandDrawnHeart: React.FC<{
  className?: string;
  fill?: string;
}> = ({
  className = "w-5 h-5",
  fill = "currentColor",
}) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const HollowHeart: React.FC<{
  className?: string;
  strokeColor?: string;
}> = ({
  className = "w-5 h-5",
  strokeColor = "currentColor",
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 20.2 C7 15.5, 3.5 12.5, 3.5 8.5 C3.5 5.8, 5.6 3.8, 8.2 3.8 C10 3.8, 11.4 4.8, 12 6 C12.6 4.8, 14 3.8, 15.8 3.8 C18.4 3.8, 20.5 5.8, 20.5 8.5 C20.5 12.5, 17 15.5, 12 20.2 Z"
      stroke={strokeColor}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const BotanicalLeaf: React.FC<{ className?: string }> = ({
  className = "w-8 h-8 text-paw-warm-sage opacity-50",
}) => (
  <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M40 8C30 8 18 16 12 28C10 32 10 38 12 40C14 42 20 42 24 40C36 34 44 22 44 12C44 10 42 8 40 8Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 40C20 32 28 24 38 14" />
    <path d="M22 30C26 30 30 28 32 26" />
    <path d="M16 36C18 35 22 34 24 32" />
    <path d="M28 24C32 24 35 22 37 20" />
  </svg>
);

export const CatDogLineArt: React.FC<{ className?: string }> = ({
  className = "w-44 sm:w-52 h-auto text-white/90",
}) => (
  <svg
    viewBox="0 0 220 160"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Dog silhouette line */}
    <path d="M70 145 C65 100, 70 70, 95 45 C105 35, 120 38, 128 50 C132 56, 128 66, 122 72 C120 85, 122 115, 125 145" />
    <path d="M102 45 C95 55, 90 75, 96 85" />
    <path d="M112 40 C125 32, 135 42, 128 56" />

    {/* Cat silhouette line */}
    <path d="M125 145 C125 110, 130 90, 145 75 C150 70, 160 72, 165 80 C168 85, 165 92, 162 98 C160 110, 162 130, 165 145" />
    <path d="M142 75 L146 62 L152 74" />
    <path d="M158 74 L164 62 L166 76" />

    {/* Intertwined Heart Loop connecting dog and cat */}
    <path
      d="M172 135 C190 135, 205 115, 195 98 C188 88, 175 95, 170 105 C165 95, 152 88, 145 98 C135 115, 150 135, 170 142"
      stroke="#6F9F89"
      strokeWidth="2"
    />
  </svg>
);
