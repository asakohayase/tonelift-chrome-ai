import React from "react";

interface VoiceWaveLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const VoiceWaveLogo: React.FC<VoiceWaveLogoProps> = ({
  width = 256,
  height = 174,
  className,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 256 174"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Rectangle */}
      <rect width="256" height="174" fill="black" />
      
      {/* Voice Wave Pattern */}
      <defs>
        <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4ade80" /> {/* lime-400 */}
          <stop offset="50%" stopColor="#22c55e" /> {/* green-500 */}
          <stop offset="100%" stopColor="#16a34a" /> {/* green-600 */}
        </linearGradient>
      </defs>
      
      {/* Main Wave Path */}
      <path
        d="M20 87
           L40 47 L60 127 L80 27 L100 147
           L120 47 L140 127 L160 27 L180 147
           L200 47 L220 127 L236 87"
        stroke="url(#waveGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default VoiceWaveLogo;