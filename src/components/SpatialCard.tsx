"use client";
import React from "react";

export default function SpatialCard({
  children,
  className = "",
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={`group relative card-elevated p-6 ${glow ? "shadow-glow" : ""} ${className}`}>
      {children}
    </div>
  );
}
