// Legal & informational page content for GovGuide AI.
// Keep language plain and honest: this is an independent platform, never an
// official government source. Update `updated` whenever content changes.

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDoc = {
  title: string;
  description: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

/** Placeholder support address — replace with your real support inbox. */
export const contactEmail = "support@govguide.example";

export const aboutDoc: LegalDoc = {
  title: "About GovGuide AI",
  description: "Who we are, what we do, and what we are not.",
  intro:
    "GovGuide AI is an independent Indian government-services information and guidance platform. We help you find services, understand eligibility, prepare documents, and reach the right official sources.",
  updated: "22 September 2026",
  sections: [
    {
      heading: "Our mission",
      paragraphs: [
        "Government services are often hard to navigate: requirements are scattered across portals, language can be confusing, and it is not always clear where to start. GovGuide AI brings that information together in one clear, multilingual place.",
      ],
      bullets: [
        "Find government services relevant to your need",
        "Understand who is eligible and what documents are required",
        "Follow step-by-step application guidance",
        "Verify information against official sources",
        "Use the platform in your preferred language",
        "Get AI-assisted explanations of verified information",
      ],
    },
    {
      heading: "What we are not",
      paragraphs: [
        "GovGuide AI is an independent guidance platform. It is not a government authority, is not affiliated with any government department, and does not issue, approve, or process any application or document.",
        "For anything that has legal or official effect — submitting applications, paying fees, or confirming requirements — always rely on the official source linked on each service page.",
      ],
    },
    {
      heading: "How we keep information reliable",
      paragraphs: [
        "Service information is stored in our own database together with links to official sources. Our AI assistant answers from that verified information first; it never invents government requirements. If we cannot verify something, we say so.",
      ],
      bullets: [
        "Database-first: answers come from stored service records",
        "Official sources are displayed on every service page",
        "Unverifiable questions are refused, not guessed",
        "Found something wrong? Use the contact page and we will review it",
      ],
    },
  ],
};

// --- APPEND REMAINING DOCS BELOW ---

export const privacyPolicy: LegalDoc = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your information.",
  intro:
    "This policy explains what information GovGuide AI collects, why we collect it, and the choices you have. We designed the platform to need as little personal information as possible.",
  updated: "22 September 2026",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "GovGuide AI is an independent government-services guidance platform. This Privacy Policy applies to your use of the website and its AI assistant.",
      ],
    },
    {
      heading: "Information we collect",
      paragraphs: ["We only collect what we need to run the platform:"],
      bullets: [
        "Account information: your email address, if you sign in or create an account",
        "Saved content: services you save and document checklists you tick (linked to your account)",
        "Messages you send through the contact form",
        "Technical logs: basic server logs such as IP address, browser type, and pages visited",
        "AI questions: processed in real time to generate answers; conversations are not permanently stored by us",
      ],
    },
    {
      heading: "How we use your information",
      paragraphs: ["We use information to:"],
      bullets: [
        "Provide and personalise the guidance you request",
        "Remember your saved services and checklist progress",
        "Respond to messages you send us",
        "Keep the platform secure, prevent abuse, and rate-limit AI requests",
        "Understand aggregate usage so we can improve the service",
      ],
    },
    {
      heading: "AI assistance",
      paragraphs: [
        "Your questions are sent to our server and, when available, to an AI provider to generate an answer grounded in our verified service database. Please do not include sensitive personal data (such as Aadhaar, PAN, bank, or password details) in AI questions — it is never required to use the assistant.",
      ],
    },
    {
      heading: "Cookies and local storage",
      paragraphs: [
        "We use essential browser storage to remember your language choice, Easy Mode preference, and sign-in session. We do not use advertising cookies.",
      ],
    },
    {
      heading: "Data sharing",
      paragraphs: [
        "We do not sell your personal information. We share information only with the infrastructure providers that run the platform (such as our hosting and authentication providers) and when required by law.",
      ],
    },
    {
      heading: "Data security and retention",
      paragraphs: [
        "Data is protected with industry-standard security, including row-level security in our database and server-side API keys that are never exposed to your browser. We keep account data while your account exists and delete or anonymise it on request.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You may request a copy of your data, correction of inaccuracies, or deletion of your account at any time using the contact page. You can also stop using the platform without an account — most features are available anonymously.",
      ],
    },
    {
      heading: "Official sources and external links",
      paragraphs: [
        "Our pages link to official government websites. Their privacy practices are governed by their own policies, not ours. Review them before submitting personal information to any government portal.",
      ],
    },
    {
      heading: "Changes to this policy",
      paragraphs: [
        "We will update this page when our practices change. The date at the top shows when it was last updated.",
      ],
    },
    {
      heading: "Contact us",
      paragraphs: [
        "Questions about this policy? Use the contact page and we will respond as soon as we can.",
      ],
    },
  ],
};

// --- APPEND TERMS AND CONTACT BELOW ---

export const termsOfService: LegalDoc = {
  title: "Terms of Service",
  description: "The rules for using GovGuide AI.",
  intro:
    "By using GovGuide AI you agree to these terms. We keep them simple on purpose — this platform provides guidance only, never official services.",
  updated: "22 September 2026",
  sections: [
    {
      heading: "What this platform is",
      paragraphs: [
        "GovGuide AI is an independent information and guidance platform for Indian government services. It helps you discover services, understand eligibility and documents, and find official sources.",
      ],
    },
    {
      heading: "What this platform is not",
      paragraphs: [
        "GovGuide AI is not a government authority and is not affiliated with any government department. It does not issue, approve, process, or guarantee any application, certificate, licence, benefit, or document.",
        "Nothing on this website constitutes legal, financial, or official advice. Only official government portals and offices can give answers with official effect.",
      ],
    },
    {
      heading: "Your responsibilities",
      paragraphs: ["When using this website you agree to:"],
      bullets: [
        "Provide accurate information when you create an account",
        "Keep your sign-in credentials secure",
        "Use the platform only for personal, lawful guidance purposes",
        "Not attempt to disrupt, scrape abusively, or misuse the service",
        "Verify important information against the linked official source before acting",
      ],
    },
    {
      heading: "AI-assisted responses",
      paragraphs: [
        "Our AI assistant explains information retrieved from our verified service database and official sources. It can make mistakes in wording — always treat the linked official source as authoritative. Never share Aadhaar, PAN, bank, or password details with the assistant.",
      ],
    },
    {
      heading: "Fees and payments",
      paragraphs: [
        "GovGuide AI does not collect application fees. If a service has a fee, you pay it only on the official government channel shown in the official sources. Beware of anyone asking you to pay a fee through this website.",
      ],
    },
    {
      heading: "External links",
      paragraphs: [
        "We link to official government websites for convenience. We do not control their content, availability, or practices, and we are not responsible for what happens on them.",
      ],
    },
    {
      heading: "Availability and liability",
      paragraphs: [
        "The platform is provided as-is without warranties of any kind. To the extent permitted by law, we are not liable for losses arising from reliance on the information presented without checking the official source.",
      ],
    },
    {
      heading: "Changes to these terms",
      paragraphs: [
        "We may update these terms over time. The date at the top shows the latest revision. Continued use after changes means you accept the updated terms.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about these terms? Use the contact page and we will respond as soon as we can.",
      ],
    },
  ],
};

export const contactPage = {
  kicker: "Get in touch",
  title: "Contact us",
  lead:
    "Questions, corrections, or feedback? We read everything. Please do not send Aadhaar, PAN, bank, or other sensitive numbers — we will never ask for them.",
};

export const siteConfig = {
  contactEmail,
  responseTime: "We usually reply within 2–3 working days.",
};
