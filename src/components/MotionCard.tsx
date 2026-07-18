"use client";
import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function MotionCard({
  children,
  className = "",
  lift = 4,
}: {
  children: React.ReactNode;
  className?: string;
  lift?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
    >
      {children}
    </motion.div>
  );
}
