"use client";

import type { LucideIcon } from "lucide-react";
import {
  Award,
  Baby,
  Bell,
  Briefcase,
  Building2,
  Car,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Compass,
  CreditCard,
  FileText,
  Files,
  Fingerprint,
  FolderLock,
  Folders,
  GraduationCap,
  HeartPulse,
  Landmark,
  Laptop,
  ListChecks,
  Lock,
  Map,
  MapPin,
  PiggyBank,
  Radar,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  Smartphone,
  Store,
  Timer,
  Vote,
  Wallet,
  Wheat,
  Wrench,
} from "lucide-react";

const icons = {
  Award,
  Baby,
  Bell,
  Briefcase,
  Building2,
  Car,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Compass,
  CreditCard,
  FileText,
  Files,
  Fingerprint,
  FolderLock,
  Folders,
  GraduationCap,
  HeartPulse,
  Landmark,
  Laptop,
  ListChecks,
  Lock,
  Map,
  MapPin,
  PiggyBank,
  Radar,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  Smartphone,
  Store,
  Timer,
  Vote,
  Wallet,
  Wheat,
  Wrench,
} satisfies Record<string, LucideIcon>;

/**
 * Resolve a config icon key to a Lucide component. Unknown keys fall back to
 * a neutral compass so a typo in src/config/home.ts can never crash a card.
 */
export function HomeIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = (icons as Record<string, LucideIcon>)[name] ?? Compass;
  return <Icon className={className} aria-hidden="true" />;
}
