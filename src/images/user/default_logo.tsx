import React from 'react';

const SmallLogo = () => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left brain (yellow) */}
      <path
        d="M30 50C30 35 40 25 50 25C45 35 45 45 50 50C45 55 45 65 50 75C40 75 30 65 30 50Z"
        fill="#FFD700"
        stroke="#E75480"
        strokeWidth="2"
      />
      
      {/* Right brain (pink) */}
      <path
        d="M70 50C70 35 60 25 50 25C55 35 55 45 50 50C55 55 55 65 50 75C60 75 70 65 70 50Z"
        fill="#FFB6C1"
        stroke="#E75480"
        strokeWidth="2"
      />
      
      {/* Eyes */}
      <circle cx="45" cy="45" r="3" fill="#1C2434" />
      <circle cx="55" cy="45" r="3" fill="#1C2434" />
      
      {/* Smile */}
      <path
        d="M45 55C45 55 47 58 50 58C53 58 55 55 55 55"
        stroke="#1C2434"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Feet */}
      <path
        d="M45 75L45 85"
        stroke="#E75480"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M55 75L55 85"
        stroke="#E75480"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SmallLogo;