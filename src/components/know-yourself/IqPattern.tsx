"use client";

import type { IqPattern as IqPatternData, IqShape } from "@/data/logicalIqTest";

/**
 * SVG renderer for a single pattern cell. Adapted from the open-source
 * rpm-iq-exam "PatternDisplay" component, recolored for the ivory premium
 * identity: shapes drawn in deep navy / medical blue / outlined on white cells.
 */

const TONE = {
  solid: { fill: "#10203A", stroke: "none", strokeWidth: 0 }, // deep navy
  accent: { fill: "#2563EB", stroke: "none", strokeWidth: 0 }, // medical blue
  outline: { fill: "#FFFFFF", stroke: "#10203A", strokeWidth: 2.4 },
} as const;

function Shape({ shape, size }: { shape: IqShape; size: number }) {
  const x = (shape.x ?? 0.5) * size;
  const y = (shape.y ?? 0.5) * size;
  const sizeMap = { small: size * 0.34, medium: size * 0.48, large: size * 0.62 };
  const s = sizeMap[shape.size];
  const tone = TONE[shape.tone];
  const transform = shape.rotation ? `rotate(${shape.rotation} ${x} ${y})` : undefined;
  const common = {
    fill: tone.fill,
    stroke: tone.stroke,
    strokeWidth: tone.strokeWidth,
    transform,
  };

  switch (shape.type) {
    case "circle":
      return <circle cx={x} cy={y} r={s / 2} {...common} />;
    case "square":
      return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={s * 0.08} {...common} />;
    case "triangle":
      return (
        <polygon
          points={`${x},${y - s / 2} ${x - s / 2},${y + s / 2} ${x + s / 2},${y + s / 2}`}
          {...common}
        />
      );
    case "diamond":
      return (
        <polygon
          points={`${x},${y - s / 2} ${x + s / 2},${y} ${x},${y + s / 2} ${x - s / 2},${y}`}
          {...common}
        />
      );
    case "cross": {
      const t = s * 0.34;
      return (
        <g transform={transform}>
          <rect x={x - t / 2} y={y - s / 2} width={t} height={s} fill={tone.fill} stroke={tone.stroke} strokeWidth={tone.strokeWidth} />
          <rect x={x - s / 2} y={y - t / 2} width={s} height={t} fill={tone.fill} stroke={tone.stroke} strokeWidth={tone.strokeWidth} />
        </g>
      );
    }
    case "star": {
      const pts: string[] = [];
      const outer = s / 2;
      const inner = outer * 0.42;
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        pts.push(`${x + r * Math.cos(a)},${y + r * Math.sin(a)}`);
      }
      return <polygon points={pts.join(" ")} {...common} />;
    }
    default:
      return null;
  }
}

export default function IqPattern({
  pattern,
  size = 76,
  className,
}: {
  pattern: IqPatternData;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      {pattern.shapes.map((shape, i) => (
        <Shape key={i} shape={shape} size={size} />
      ))}
    </svg>
  );
}
