import React, { memo } from "react";

interface FrameProps {
  solar?: boolean;
  round?: boolean;
  amber?: boolean;
  hero?: boolean;
  className?: string;
}

export const FrameArt = memo(function FrameArt({
  solar = false,
  round = false,
  amber = false,
  hero = false,
  className = "",
}: FrameProps) {
  const stroke = amber ? "#80522c" : "#172735";
  const gradientId = hero ? "heroLensGrad" : solar ? "solarLensGrad" : "clearLensGrad";

  return (
    <svg
      className={`${hero ? "frame-art hero-frame" : "frame-art"} ${className}`}
      viewBox="0 0 680 300"
      role="img"
      aria-label={solar ? "Ilustração de óculos de sol" : "Ilustração de armação de óculos"}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop
            stopColor={solar ? "#17232d" : "#76b7de"}
            stopOpacity={solar ? ".95" : ".35"}
          />
          <stop
            offset="1"
            stopColor={solar ? "#354e5f" : "#b9d8ed"}
            stopOpacity={solar ? ".95" : ".03"}
          />
        </linearGradient>
      </defs>
      <path
        d="M90 102 L52 40 Q46 28 64 25 L260 62 M580 102 L620 40 Q628 29 613 25 L415 62"
        fill="none"
        stroke={stroke}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M74 100 Q158 70 282 97 Q306 116 285 200 Q275 237 222 240 L134 235 Q86 230 80 190 Z"
        fill={`url(#${gradientId})`}
        stroke={stroke}
        strokeWidth="15"
        strokeLinejoin="round"
      />
      <path
        d="M606 100 Q522 70 398 97 Q374 116 395 200 Q405 237 458 240 L546 235 Q594 230 600 190 Z"
        fill={`url(#${gradientId})`}
        stroke={stroke}
        strokeWidth="15"
        strokeLinejoin="round"
      />
      <path d="M288 120 Q340 92 392 120" stroke={stroke} strokeWidth="12" fill="none" />
      <path
        d="M92 108 Q175 86 271 105 M408 105 Q508 86 587 108"
        stroke="#c2d7e4"
        strokeWidth="3"
        fill="none"
        opacity=".7"
      />
      <path
        d="M104 107 L114 118 L121 106 M563 106 L573 117 L580 105"
        stroke="#e6c46c"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  );
});
