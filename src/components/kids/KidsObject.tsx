"use client";
import type { ObjectId } from "@/data/kidsGameObjects";
import { GAME_OBJECTS } from "@/data/kidsGameObjects";

/**
 * Renders a health-safe game object as a self-contained, glowing inline SVG.
 * No external images are used. Decorative by default (aria-hidden); pass a
 * `title` to expose an accessible name.
 */
export default function KidsObject({
  id,
  size = 56,
  glow = true,
  title,
  className = "",
}: {
  id: ObjectId;
  size?: number;
  glow?: boolean;
  title?: string;
  className?: string;
}) {
  const color = GAME_OBJECTS[id].color;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      style={glow ? { filter: `drop-shadow(0 4px 14px ${color}66)` } : undefined}
    >
      {title ? <title>{title}</title> : null}
      <Shape id={id} color={color} />
    </svg>
  );
}

function Shape({ id, color }: { id: ObjectId; color: string }) {
  switch (id) {
    case "water":
      return (
        <g>
          <path d="M32 6C32 6 14 28 14 40a18 18 0 1 0 36 0C50 28 32 6 32 6Z" fill={color} />
          <path d="M24 38a8 10 0 0 0 6 12" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "apple":
      return (
        <g>
          <path d="M32 18c-5-6-16-5-18 4-2 9 4 24 10 28 3 2 5 2 8 0 6-4 12-19 10-28-2-9-13-10-18-4Z" fill={color} />
          <path d="M32 18c0-5 3-9 8-10" fill="none" stroke="#7a4a2b" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 9c4-2 9 0 10 4-4 2-9 0-10-4Z" fill="#5fd0a0" />
        </g>
      );
    case "heart":
      return (
        <path d="M32 54C12 40 8 27 14 19c5-7 14-5 18 2 4-7 13-9 18-2 6 8 2 21-18 35Z" fill={color} />
      );
    case "star":
      return (
        <path d="M32 6l7 16 17 1-13 11 4 17-15-9-15 9 4-17L8 23l17-1 7-16Z" fill={color} />
      );
    case "moon":
      return (
        <path d="M42 8a24 24 0 1 0 14 38A20 20 0 0 1 42 8Z" fill={color} />
      );
    case "tooth":
      return (
        <g>
          <rect x="27" y="8" width="10" height="30" rx="5" fill="#e9f6ff" stroke={color} strokeWidth="3" />
          <rect x="22" y="34" width="20" height="22" rx="9" fill={color} />
          <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
            <path d="M26 42v8M32 42v8M38 42v8" />
          </g>
        </g>
      );
    case "shield":
      return (
        <g>
          <path d="M32 6l20 7v15c0 14-9 23-20 28C21 51 12 42 12 28V13l20-7Z" fill={color} />
          <path d="M24 30l6 6 12-13" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "leaf":
      return (
        <g>
          <path d="M14 50C10 28 28 12 52 12c2 22-14 40-38 38Z" fill={color} />
          <path d="M22 46C30 34 40 26 48 22" fill="none" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "carrot":
      return (
        <g>
          <path d="M22 24l20 4-12 28c-1 3-4 3-5 0L18 30c-1-4 0-5 4-6Z" fill={color} />
          <g fill="#5fd0a0">
            <path d="M24 24l-6-10 8 4Z" />
            <path d="M30 22l0-12 6 8Z" />
            <path d="M36 24l8-8-2 10Z" />
          </g>
        </g>
      );
    case "soap":
      return (
        <g>
          <rect x="14" y="30" width="36" height="22" rx="8" fill={color} />
          <circle cx="22" cy="18" r="5" fill="#ffffff" fillOpacity="0.85" />
          <circle cx="34" cy="13" r="4" fill="#ffffff" fillOpacity="0.7" />
          <circle cx="44" cy="20" r="3.5" fill="#ffffff" fillOpacity="0.6" />
        </g>
      );
    case "sun":
      return (
        <g>
          <circle cx="32" cy="32" r="14" fill={color} />
          <g stroke={color} strokeWidth="4" strokeLinecap="round">
            <path d="M32 4v8M32 52v8M4 32h8M52 32h8M11 11l6 6M47 47l6 6M53 11l-6 6M17 47l-6 6" />
          </g>
        </g>
      );
    case "banana":
      return (
        <path d="M12 22c2 18 16 30 36 28 4 0 5-4 2-6-14 2-26-8-28-24-1-4-10-2-10 2Z" fill={color} />
      );
    default:
      return <circle cx="32" cy="32" r="20" fill={color} />;
  }
}
