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
  strokeWidth = 2.2,
}: TimelineIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx("shrink-0", className)}
    >
      {/* Top track */}
      <line x1="6.5" y1="5" x2="16.5" y2="5" />
      {/* Top right turn downwards into middle track */}
      <path d="M16.5 5 A 4 4 0 0 1 16.5 13" />
      {/* Middle track */}
      <line x1="7.5" y1="13" x2="16.5" y2="13" />
      {/* Middle left turn downwards into bottom track */}
      <path d="M7.5 13 A 4 4 0 0 1 7.5 21" />
      {/* Bottom track */}
      <line x1="7.5" y1="21" x2="17.5" y2="21" />

      {/* Nodes / circles at milestones */}
      <circle cx="5" cy="5" r="1.75" />
      <circle cx="16.5" cy="5" r="1.75" />
      <circle cx="16.5" cy="13" r="1.75" />
      <circle cx="7.5" cy="13" r="1.75" />
      <circle cx="7.5" cy="21" r="1.75" />
      <circle cx="19" cy="21" r="1.75" />
    </svg>
  );
}
