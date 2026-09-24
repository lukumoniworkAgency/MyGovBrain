"use client";

import { useState } from "react";
import { AiChat } from "./ai-chat";

interface AiAssistantProps {
  serviceId?: string;
  stateCode?: string;
  languageCode: string;
  initialSuggestions?: string[];
  variant?: "inline" | "floating";
}

export function AiAssistant({ serviceId, stateCode, languageCode, initialSuggestions, variant = "inline" }: AiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "inline") {
    return (
      <AiChat
        serviceId={serviceId}
        stateCode={stateCode}
        languageCode={languageCode}
        initialSuggestions={initialSuggestions}
        className="mt-8"
      />
    );
  }

  // Floating variant
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full brand-gradient px-6 py-3.5 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 anim-pulse-ring"
        aria-label="Open AI assistant"
      >
        <span aria-hidden="true">🤖</span>
        <span className="font-medium">Ask GovGuide AI</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-lg anim-scale-in">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          aria-label="Close AI assistant"
        >
          ✕
        </button>
        <AiChat
          serviceId={serviceId}
          stateCode={stateCode}
          languageCode={languageCode}
          initialSuggestions={initialSuggestions}
          className="shadow-2xl max-h-[70vh]"
        />
      </div>
    </div>
  );
}