"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/actions";

export function AnalyticsTracker({ eventName, path, metadata }: { eventName: "service_search" | "service_view" | "language_changed"; path: string; metadata?: Record<string, string> }) {
  useEffect(() => { void trackEvent(eventName, path, metadata); }, [eventName, path, metadata]);
  return null;
}