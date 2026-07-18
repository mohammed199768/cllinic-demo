"use client";
import React from "react";

type State = "idle" | "correct" | "wrong" | "muted";

/**
 * Large, child-friendly answer button with gentle feedback states.
 * No harsh red — wrong answers use a soft amber tone.
 */
export default function GameOptionButton({
  children,
  state = "idle",
  onClick,
  disabled,
  ariaLabel,
  className = "",
}: {
  children: React.ReactNode;
  state?: State;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const styles: Record<State, string> = {
    idle: "border-navy-100 bg-white text-navy-800 hover:border-brand-300 hover:bg-brand-50",
    correct: "border-mint-400 bg-mint-50 text-mint-600",
    wrong: "border-amber-300 bg-amber-50 text-amber-600",
    muted: "border-navy-100 bg-white/60 text-navy-400 opacity-70",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-lg font-bold shadow-xs transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-default ${styles[state]} ${className}`}
    >
      {children}
    </button>
  );
}
