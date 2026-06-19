"use client";

import { Emotion } from "@/lib/emotions";

type Props = {
  emotions: Emotion[];
  onSelect: (e: Emotion) => void;
  size?: number;
};

// Build an SVG arc path for a slice of a pie chart centered at (cx, cy).
function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

export default function EmotionWheel({ emotions, onSelect, size = 360 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const slice = 360 / emotions.length;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      className="max-w-md mx-auto select-none touch-manipulation h-auto"
      role="group"
      aria-label="Emotion wheel"
    >
      {emotions.map((e, i) => {
        const start = i * slice;
        const end = (i + 1) * slice;
        const mid = start + slice / 2;
        const labelPos = polar(cx, cy, r * 0.65, mid);
        return (
          <g
            key={e.id}
            onClick={() => onSelect(e)}
            className="cursor-pointer active:opacity-80 transition-opacity"
            role="button"
            aria-label={e.name}
          >
            <path
              d={arcPath(cx, cy, r, start, end)}
              fill={e.color}
              stroke="white"
              strokeWidth={2}
            />
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none"
              fontSize={size * 0.05}
              fill="#1a1a1a"
              fontWeight={600}
            >
              <tspan x={labelPos.x} dy="-0.4em" fontSize={size * 0.07}>
                {e.emoji ?? ""}
              </tspan>
              <tspan x={labelPos.x} dy="1.4em">
                {e.name}
              </tspan>
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.18} fill="white" stroke="#e5e7eb" strokeWidth={2} />
    </svg>
  );
}
