"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Global animation policy: users who prefer reduced motion get instant,
 * non-animated content everywhere framer-motion is used.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
