import React from "react";
import clsx from "clsx";

interface TimelineIconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export default function TimelineIcon({
  size = 20,
  className,
}: TimelineIconProps) {
  const maskId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="70 30 372 452"
      fill="none"
      className={clsx("shrink-0", className)}
    >
      <defs>
        <mask id={maskId}>
          {/* Include all graphic elements */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Punch out hollow centers of circles */}
          <circle cx="154" cy="116" r="16" fill="black" />
          <circle cx="358" cy="116" r="16" fill="black" />
          <circle cx="154" cy="260" r="16" fill="black" />
          <circle cx="358" cy="260" r="16" fill="black" />
          <circle cx="154" cy="404" r="16" fill="black" />
          <circle cx="358" cy="404" r="16" fill="black" />
        </mask>
      </defs>

      <g mask={`url(#${maskId})`}>
        {/* Connecting Track Lines */}
        <path
          d="M 154 116 H 358 A 72 72 0 0 1 358 260 H 154 A 72 72 0 0 0 154 404 H 358"
          stroke="currentColor"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Node Rings */}
        <circle cx="154" cy="116" r="32" fill="currentColor" />
        <circle cx="358" cy="116" r="32" fill="currentColor" />
        <circle cx="154" cy="260" r="32" fill="currentColor" />
        <circle cx="358" cy="260" r="32" fill="currentColor" />
        <circle cx="154" cy="404" r="32" fill="currentColor" />
        <circle cx="358" cy="404" r="32" fill="currentColor" />
      </g>
    </svg>
  );
}
