/**
 * Homepage showcase content.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Static, presentational content for the marketing homepage (category cards,
 * FAQs, testimonials, job hubs). Database-backed content - service names,
 * categories, translations - stays in Supabase and is loaded through
 * src/lib/data.ts. Nothing here duplicates a database record: cards that
 * link into the directory do so through search queries or category ids
 * resolved at render time in the section component.
 */

export type CategoryShowcase = {
  /** Stable key used to match a database category by name (case-insensitive). */
  match: string;
  blurb: string;
  /** Lucide icon key resolved in category-icon.tsx. */
  icon: string;
};

export type PopularSearch = { label: string; query: string };

export type PopularService = {
  title: string;
  description: string;
  /** Human-readable processing estimate shown on the card. */
  time: string;
  icon: string;
  query: string;
};

export type JobHubCard = {
  title: string;
  description: string;
  badge: string;
  icon: string;
  query: string;
};

export type Testimonial = {
  name: string;
  location: string;
  service: string;
  feedback: string;
  initials: string;
};

export type Faq = { question: string; answer: string };

export type TrackingStep = { title: string; description: string };

export const heroStats = [
  { value: "2,400+", label: "Citizens guided" },
  { value: "120+", label: "CSC centers listed" },
  { value: "350+", label: "Services covered" },
  { value: "8,900+", label: "Applications tracked" },
] as const;

export const heroHighlights = [
  {
    title: "Government Services",
    description: "Verified steps & official sources",
    icon: "Landmark",
  },
  {
    title: "Job Updates",
    description: "Govt jobs, apprenticeships & scholarships",
    icon: "Briefcase",
  },
  {
    title: "Application Tracking",
    description: "Submit, verify, approve, done",
    icon: "ClipboardCheck",
  },
  {
    title: "Digital Documents",
    description: "Checklists for Aadhaar, PAN & more",
    icon: "FolderLock",
  },
] as const;

export const popularSearches: PopularSearch[] = [
  { label: "PAN Card", query: "PAN" },
  { label: "Aadhaar Update", query: "Aadhaar" },
  { label: "Income Certificate", query: "Income Certificate" },
  { label: "Scholarship", query: "Scholarship" },
  { label: "Government Job", query: "Job" },
];

export const categoryShowcase: CategoryShowcase[] = [
  {
    match: "identity",
    blurb: "Aadhaar, PAN, Voter ID & more",
    icon: "Fingerprint",
  },
  {
    match: "certificate",
    blurb: "Income, birth, caste & domicile",
    icon: "Award",
  },
  {
    match: "education",
    blurb: "Scholarships, admissions & exams",
    icon: "GraduationCap",
  },
  { match: "job", blurb: "Sarkari jobs, apprenticeships", icon: "Briefcase" },
  {
    match: "agriculture",
    blurb: "PM-KISAN, crop & land support",
    icon: "Wheat",
  },
  {
    match: "health",
    blurb: "Ayushman, health cards & schemes",
    icon: "HeartPulse",
  },
  { match: "bank", blurb: "Jan Dhan, DBT & pension banking", icon: "Landmark" },
  { match: "transport", blurb: "Driving licence, RC & permits", icon: "Car" },
  {
    match: "utility",
    blurb: "Electricity, water & gas bills",
    icon: "Receipt",
  },
  {
    match: "insurance",
    blurb: "PMJJBY, PMSBY & crop cover",
    icon: "ShieldCheck",
  },
  {
    match: "pension",
    blurb: "Old-age, widow & EPF pensions",
    icon: "PiggyBank",
  },
  { match: "legal", blurb: "Affidavits, land records & help", icon: "Scale" },
];

export const popularServices: PopularService[] = [
  {
    title: "PAN Card",
    description: "New application, corrections and reprint with e-KYC steps.",
    time: "7-15 days",
    icon: "CreditCard",
    query: "PAN",
  },
  {
    title: "Aadhaar Update",
    description: "Mobile, address and biometric updates at enrolment centers.",
    time: "7-30 days",
    icon: "Fingerprint",
    query: "Aadhaar",
  },
  {
    title: "Voter ID",
    description: "New registration, corrections and EPIC download via NVSP.",
    time: "15-30 days",
    icon: "Vote",
    query: "Voter",
  },
  {
    title: "Income Certificate",
    description: "State portal application with affidavit and verification.",
    time: "7-14 days",
    icon: "FileText",
    query: "Income Certificate",
  },
  {
    title: "Birth Certificate",
    description: "Registration within 21 days and duplicate copy requests.",
    time: "7-21 days",
    icon: "Baby",
    query: "Birth Certificate",
  },
  {
    title: "Scholarship",
    description: "Pre and post-matric merit schemes on NSP portal.",
    time: "30-90 days",
    icon: "GraduationCap",
    query: "Scholarship",
  },
  {
    title: "Exam Services",
    description: "Admit cards, results and counseling for board and SSC exams.",
    time: "Varies by board",
    icon: "ClipboardList",
    query: "Exam",
  },
  {
    title: "Land Records",
    description: "RoR, mutation and revenue extracts linked to domicile.",
    time: "15-45 days",
    icon: "Map",
    query: "Land",
  },
];

export const aiCapabilities = [
  {
    title: "Eligibility Check",
    description: "Answer 2-3 questions to see if you may qualify.",
    icon: "ListChecks",
  },
  {
    title: "Required Documents",
    description: "Exact checklist before you visit any office.",
    icon: "Files",
  },
  {
    title: "Service Guidance",
    description: "Step-by-step online or CSC process.",
    icon: "Compass",
  },
  {
    title: "Fees Information",
    description: "Official fee slabs, no hidden charges.",
    icon: "Wallet",
  },
  {
    title: "Processing Time",
    description: "Realistic timelines per service & state.",
    icon: "Timer",
  },
] as const;

export const trackingSteps: TrackingStep[] = [
  {
    title: "Request Submitted",
    description: "Application received with a reference ID.",
  },
  {
    title: "Verification",
    description: "Documents & details checked by the authority.",
  },
  { title: "Processing", description: "The department works on your request." },
  {
    title: "Approval",
    description: "Officer approves or asks for corrections.",
  },
  {
    title: "Completed",
    description: "Certificate delivered or benefit credited.",
  },
];

export const vaultDocuments = [
  "Aadhaar",
  "PAN",
  "Marksheet",
  "Certificates",
  "Licenses",
] as const;

export const vaultBenefits = [
  {
    title: "Secure",
    description: "Private by design - only you control access.",
    icon: "Lock",
  },
  {
    title: "Organized",
    description: "Every document tagged by service & expiry.",
    icon: "Folders",
  },
  {
    title: "Accessible",
    description: "Open checklists from any phone, anytime.",
    icon: "Smartphone",
  },
] as const;

export const jobHubCards: JobHubCard[] = [
  {
    title: "Government Jobs",
    description: "SSC, UPSC, state PSC & police recruitments.",
    badge: "1,240 open",
    icon: "Landmark",
    query: "Job",
  },
  {
    title: "Private Jobs",
    description: "Entry-level & skilled roles near your district.",
    badge: "860 open",
    icon: "Building2",
    query: "Job",
  },
  {
    title: "Apprenticeships",
    description: "ITI, diploma & graduate apprentice programs.",
    badge: "320 open",
    icon: "Wrench",
    query: "Apprentice",
  },
  {
    title: "Internships",
    description: "Paid internships for students & freshers.",
    badge: "150 open",
    icon: "Laptop",
    query: "Internship",
  },
  {
    title: "Scholarships",
    description: "Central, state & merit schemes on one list.",
    badge: "95 live",
    icon: "GraduationCap",
    query: "Scholarship",
  },
];

export const whyChooseUs = [
  {
    title: "Save Time",
    description: "Know the exact steps before you queue up.",
    icon: "Clock",
  },
  {
    title: "Save Money",
    description: "Official fees only - spot overcharging instantly.",
    icon: "Wallet",
  },
  {
    title: "Reduce Paperwork",
    description: "Carry only the documents that matter.",
    icon: "Files",
  },
  {
    title: "Nearby Assistance",
    description: "Verified CSC centers in your city or PIN.",
    icon: "MapPin",
  },
  {
    title: "Application Tracking",
    description: "Five-stage status from submit to done.",
    icon: "ClipboardCheck",
  },
  {
    title: "Secure Storage",
    description: "Checklists & reminders keep papers ready.",
    icon: "ShieldCheck",
  },
] as const;

export const howItWorks = [
  {
    title: "Search Service",
    description: "Type PAN, scholarship, job... and pick your service.",
    icon: "Search",
  },
  {
    title: "Choose CSC or Online",
    description: "Follow the self-guide or visit a listed center.",
    icon: "Store",
  },
  {
    title: "Track Progress",
    description: "Save it and follow submit, verify, done.",
    icon: "Radar",
  },
] as const;

export const testimonials: Testimonial[] = [
  {
    name: "Meera Devi",
    location: "Nagaon, Assam",
    service: "Income Certificate",
    feedback:
      "The document checklist saved me two trips. The CSC center verified everything in one visit.",
    initials: "MD",
  },
  {
    name: "Rahul Verma",
    location: "Patna, Bihar",
    service: "Scholarship",
    feedback:
      "I finally understood the eligibility rules. Applied on NSP without paying any agent fee.",
    initials: "RV",
  },
  {
    name: "Anita Sharma",
    location: "Jaipur, Rajasthan",
    service: "Aadhaar Update",
    feedback:
      "AI guidance told me exactly which center does biometric updates. Done in 20 minutes.",
    initials: "AS",
  },
];

export const faqs: Faq[] = [
  {
    question: "What is this platform?",
    answer:
      "GovGuide AI is an independent guidance platform for Indian government services. We explain eligibility, documents, steps, and official sources - we are not a government authority and never process applications ourselves.",
  },
  {
    question: "How do I find CSC centers?",
    answer:
      "Open any service page and use Find help nearby with your city or 6-digit PIN code. Only verified, listed centers appear, with Call and WhatsApp options.",
  },
  {
    question: "How do I track applications?",
    answer:
      "Save a service to My Services from any service page. You can then follow the five stages - submitted, verification, processing, approval, completed - with reminders.",
  },
  {
    question: "Is document storage secure?",
    answer:
      "Yes. Checklists live in your own account, we never ask for Aadhaar, PAN, bank, or password details, and official fees are only ever paid on government portals.",
  },
  {
    question: "Is there any service fee?",
    answer:
      "GovGuide AI guidance is free. If a service itself has an official government fee, you pay it only on the linked official portal - never through this website.",
  },
];

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GovGuide AI",
  description:
    "Independent Indian government-services information and guidance platform.",
  slogan: "Save Time. Save Money. Reduce Paperwork.",
};
