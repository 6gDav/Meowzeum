import React, { useState, useEffect, useRef } from 'react';

interface EyePosition {
  x: number;
  y: number;
}

interface CursorWatchingCatProps {
  /** Tailwind classes controlling the size, e.g. "w-20 h-20". */
  className?: string;
}

// Eye socket centers inside the 400x400 SVG coordinate space
const LEFT_EYE_CENTER = { x: 140, y: 200 };
const RIGHT_EYE_CENTER = { x: 260, y: 200 };
const MAX_PUPIL_DISTANCE = 18; // Max units the pupil can move from center

export const CursorWatchingCat: React.FC<CursorWatchingCatProps> = ({
  className = 'w-28 h-28',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [leftEyeOffset, setLeftEyeOffset] = useState<EyePosition>({ x: 0, y: 0 });
  const [rightEyeOffset, setRightEyeOffset] = useState<EyePosition>({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState<EyePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      // Convert screen mouse coordinates into the 400x400 SVG viewBox space
      const scaleX = 400 / rect.width;
      const scaleY = 400 / rect.height;

      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;

      const calculateOffset = (center: { x: number; y: number }): EyePosition => {
        const dx = mouseX - center.x;
        const dy = mouseY - center.y;
        const angle = Math.atan2(dy, dx);
        // Smooth distance calculation capped at MAX_PUPIL_DISTANCE
        const distance = Math.min(MAX_PUPIL_DISTANCE, Math.hypot(dx, dy) * 0.12);

        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        };
      };

      setLeftEyeOffset(calculateOffset(LEFT_EYE_CENTER));
      setRightEyeOffset(calculateOffset(RIGHT_EYE_CENTER));

      // Subtle parallax movement for the nose/whiskers to give 3D depth
      const centerDx = (mouseX - 200) * 0.03;
      const centerDy = (mouseY - 200) * 0.03;
      setHeadTilt({
        x: Math.max(-8, Math.min(8, centerDx)),
        y: Math.max(-8, Math.min(8, centerDy)),
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 400 400"
      aria-hidden="true"
      className={`select-none overflow-visible shrink-0 ${className}`}
      style={{ filter: 'drop-shadow(0 8px 12px rgba(0, 0, 0, 0.12))' }}
    >
      {/* Left Ear */}
      <polygon points="75,190 55,45 175,105" fill="#1e293b" stroke="#1e293b" strokeWidth="12" strokeLinejoin="round" />
      <polygon points="85,165 72,68 152,112" fill="#fda4af" stroke="#fda4af" strokeWidth="6" strokeLinejoin="round" />

      {/* Right Ear */}
      <polygon points="325,190 345,45 225,105" fill="#1e293b" stroke="#1e293b" strokeWidth="12" strokeLinejoin="round" />
      <polygon points="315,165 328,68 248,112" fill="#fda4af" stroke="#fda4af" strokeWidth="6" strokeLinejoin="round" />

      {/* Main Head */}
      <ellipse cx="200" cy="215" rx="140" ry="120" fill="#1e293b" />

      {/* Cheeks / Tuft */}
      <ellipse cx="200" cy="240" rx="150" ry="85" fill="#1e293b" />

      {/* Left Eye Socket (Sclera) */}
      <circle cx={LEFT_EYE_CENTER.x} cy={LEFT_EYE_CENTER.y} r="42" fill="#facc15" />
      <circle cx={LEFT_EYE_CENTER.x} cy={LEFT_EYE_CENTER.y} r="42" fill="none" stroke="#0f172a" strokeWidth="4" />

      {/* Right Eye Socket (Sclera) */}
      <circle cx={RIGHT_EYE_CENTER.x} cy={RIGHT_EYE_CENTER.y} r="42" fill="#facc15" />
      <circle cx={RIGHT_EYE_CENTER.x} cy={RIGHT_EYE_CENTER.y} r="42" fill="none" stroke="#0f172a" strokeWidth="4" />

      {/* Left Pupil */}
      <g transform={`translate(${leftEyeOffset.x}, ${leftEyeOffset.y})`}>
        <ellipse cx={LEFT_EYE_CENTER.x} cy={LEFT_EYE_CENTER.y} rx="14" ry="24" fill="#0f172a" />
        {/* Eye Glint */}
        <circle cx={LEFT_EYE_CENTER.x - 5} cy={LEFT_EYE_CENTER.y - 8} r="5" fill="#ffffff" />
        <circle cx={LEFT_EYE_CENTER.x + 5} cy={LEFT_EYE_CENTER.y + 8} r="2.5" fill="#ffffff" />
      </g>

      {/* Right Pupil */}
      <g transform={`translate(${rightEyeOffset.x}, ${rightEyeOffset.y})`}>
        <ellipse cx={RIGHT_EYE_CENTER.x} cy={RIGHT_EYE_CENTER.y} rx="14" ry="24" fill="#0f172a" />
        {/* Eye Glint */}
        <circle cx={RIGHT_EYE_CENTER.x - 5} cy={RIGHT_EYE_CENTER.y - 8} r="5" fill="#ffffff" />
        <circle cx={RIGHT_EYE_CENTER.x + 5} cy={RIGHT_EYE_CENTER.y + 8} r="2.5" fill="#ffffff" />
      </g>

      {/* Nose, Mouth & Whiskers (with subtle parallax movement) */}
      <g transform={`translate(${headTilt.x}, ${headTilt.y})`}>
        {/* Pink Nose */}
        <polygon
          points="186,252 214,252 200,268"
          fill="#fda4af"
          stroke="#fda4af"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Mouth ('W' shape) */}
        <path
          d="M 200,270 Q 185,290 170,278 M 200,270 Q 215,290 230,278"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Left Whiskers */}
        <line x1="75" y1="245" x2="25" y2="235" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="75" y1="260" x2="20" y2="260" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="75" y1="275" x2="25" y2="285" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />

        {/* Right Whiskers */}
        <line x1="325" y1="245" x2="375" y2="235" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="325" y1="260" x2="380" y2="260" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <line x1="325" y1="275" x2="375" y2="285" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default CursorWatchingCat;
