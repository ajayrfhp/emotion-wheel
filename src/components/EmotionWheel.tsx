"use client";

import { Emotion } from "@/lib/emotions";

type Props = {
  emotions: Emotion[];
  onSelect: (e: Emotion) => void;
  size?: number;
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// Simple pie slice (wedge from center to outer radius).
function wedgePath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

// Annular sector (donut slice).
function annularPath(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
) {
  const oStart = polar(cx, cy, rOuter, endAngle);
  const oEnd = polar(cx, cy, rOuter, startAngle);
  const iStart = polar(cx, cy, rInner, startAngle);
  const iEnd = polar(cx, cy, rInner, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${oEnd.x} ${oEnd.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${oStart.x} ${oStart.y}`,
    `L ${iEnd.x} ${iEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${iStart.x} ${iStart.y}`,
    "Z",
  ].join(" ");
}

// Lighten a hex color toward white by a given amount [0..1].
function lighten(hex: string, amount: number): string {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return hex;
  const r = parseInt(m[1], 16);
  const g = parseInt(m[2], 16);
  const b = parseInt(m[3], 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

export default function EmotionWheel({ emotions, onSelect, size = 460 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;
  const hasChildren = emotions.some((e) => e.children && e.children.length > 0);

  if (!hasChildren) {
    // ---- Single ring (original layout) ----
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
              <path d={wedgePath(cx, cy, r, start, end)} fill={e.color} stroke="white" strokeWidth={2} />
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

  // ---- Two-ring layout ----
  const coreSlice = 360 / emotions.length;
  const rInner = r * 0.42;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      className="max-w-lg mx-auto select-none touch-manipulation h-auto"
      role="group"
      aria-label="Emotion wheel"
    >
      {emotions.map((core, i) => {
        const cStart = i * coreSlice;
        const cEnd = (i + 1) * coreSlice;
        const cMid = cStart + coreSlice / 2;
        const corePos = polar(cx, cy, rInner * 0.72, cMid);
        const children = core.children ?? [];
        const subSlice = children.length ? coreSlice / children.length : 0;
        const lighter = lighten(core.color, 0.35);

        return (
          <g key={core.id}>
            {/* Inner core wedge */}
            <g
              onClick={() => onSelect(core)}
              className="cursor-pointer active:opacity-80 transition-opacity"
              role="button"
              aria-label={core.name}
            >
              <path
                d={wedgePath(cx, cy, rInner, cStart, cEnd)}
                fill={core.color}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={corePos.x}
                y={corePos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none"
                fontSize={size * 0.038}
                fill="#1a1a1a"
                fontWeight={700}
              >
                <tspan x={corePos.x} dy="-0.3em" fontSize={size * 0.05}>
                  {core.emoji ?? ""}
                </tspan>
                <tspan x={corePos.x} dy="1.3em">
                  {core.name}
                </tspan>
              </text>
            </g>

            {/* Outer ring: sub-emotions */}
            {children.map((sub, j) => {
              const sStart = cStart + j * subSlice;
              const sEnd = sStart + subSlice;
              const sMid = sStart + subSlice / 2;
              // Anchor label near the outer edge so longer words extend inward
              // within the slice rather than spilling past neighbors.
              const labelR = r * 0.94;
              const labelPos = polar(cx, cy, labelR, sMid);
              // Unflipped rotation would be (sMid - 90). That produces
              // upside-down text whenever sMid is in (180°, 360°) — the
              // left half of the wheel. Flip those by +180°.
              const flip = sMid > 180;
              const rotation = flip ? sMid + 90 : sMid - 90;
              const anchor = flip ? "start" : "end";
              const enriched: Emotion = {
                ...sub,
                color: sub.color || lighter,
                emoji: sub.emoji ?? core.emoji,
              };
              const shortName = sub.name.length > 9 ? sub.name.slice(0, 8) + "…" : sub.name;
              return (
                <g
                  key={sub.id}
                  onClick={() => onSelect(enriched)}
                  className="cursor-pointer active:opacity-80 transition-opacity"
                  role="button"
                  aria-label={sub.name}
                >
                  <path
                    d={annularPath(cx, cy, rInner, r, sStart, sEnd)}
                    fill={enriched.color}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="pointer-events-none"
                    fontSize={size * 0.026}
                    fill="#1a1a1a"
                    fontWeight={500}
                    transform={`rotate(${rotation}, ${labelPos.x}, ${labelPos.y})`}
                  >
                    {shortName}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={rInner * 0.18} fill="white" stroke="#e5e7eb" strokeWidth={2} />
    </svg>
  );
}
