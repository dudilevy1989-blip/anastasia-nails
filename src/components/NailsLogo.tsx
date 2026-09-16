import React from 'react';
import nailsLogoImg from '../assets/images/nails_logo_1789541958803.jpg';

interface NailsLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withRing?: boolean;
}

const sizeMap = {
  xs: 'w-7 h-7 rounded-lg',
  sm: 'w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl',
  md: 'w-12 h-12 rounded-2xl',
  lg: 'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl',
  xl: 'w-16 h-16 sm:w-20 sm:h-20 rounded-3xl',
};

/**
 * Premium Nail Studio Logo for Anastasia Nails.
 * Features an elegant manicured nail emblem with glossy finish and luxury rose-gold/pink styling.
 */
export const NailsLogo: React.FC<NailsLogoProps> = ({
  size = 'md',
  className = '',
  withRing = true,
}) => {
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 shadow-md ${
        withRing ? 'ring-2 ring-[#c783b9]/40 ring-offset-2 ring-offset-white' : ''
      } ${sizeClass} ${className}`}
      style={{ aspectRatio: '1/1' }}
    >
      <img
        src={nailsLogoImg}
        alt="Anastasia Nails Logo - לוגו ציפורניים"
        className="w-full h-full object-cover select-none"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

/**
 * Stylized SVG Nail / Manicure Icon for vector use cases
 */
export const NailPolishIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Sleek manicured almond-shaped fingernail with lacquer shine and cuticle arch */}
      <path
        d="M8 11.5V18C8 20.2091 9.79086 22 12 22C14.2091 22 16 20.2091 16 18V11.5C16 7.5 12 2 12 2C12 2 8 7.5 8 11.5Z"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path d="M8 11.5V18C8 20.2091 9.79086 22 12 22C14.2091 22 16 20.2091 16 18V11.5C16 7.5 12 2 12 2C12 2 8 7.5 8 11.5Z" />
      {/* Glossy reflection on nail edge */}
      <path d="M10 8C9.5 9.5 9.5 13 9.5 15" strokeLinecap="round" opacity="0.8" />
      {/* Almond French tip accent curve */}
      <path d="M8.8 6.8C10.2 4.2 12 2 12 2C12 2 13.8 4.2 15.2 6.8" opacity="0.6" />
      {/* Luxury sparkle star */}
      <path
        d="M19 4L19.5 6L21.5 6.5L19.5 7L19 9L18.5 7L16.5 6.5L18.5 6L19 4Z"
        fill="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  );
};
