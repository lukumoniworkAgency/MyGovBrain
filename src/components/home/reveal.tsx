"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in seconds. Keep small; parents cap index-based delays. */
  delay?: number;
  className?: string;
}

/**
 * Scroll-triggered fade-up. Renders through framer-motion's whileInView so
 * below-fold sections animate once on entry; above-fold content animates on
 * mount. Reduced-motion users get instant content via the global
 * MotionConfig (reducedMotion="user") in the root layout.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
