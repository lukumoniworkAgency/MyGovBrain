"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string }[];
  needs_clarification?: boolean;
  clarification_question?: string | null;
};

interface AiChatProps {
  serviceId?: string;
  stateCode?: string;
  languageCode: string;
  initialSuggestions?: string[];
  className?: string;
}

export function AiChat({ serviceId, stateCode, languageCode, initialSuggestions = [], className = "" }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = initialSuggestions.length > 0 ? initialSuggestions : [
    "What documents do I need?",
    "Who can apply?",
    "How do I apply?",
    "What is the fee?",
    "Where do I apply?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: {
            question: text,
            language_code: languageCode,
            service_id: serviceId,
            state_code: stateCode,
            conversation_history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          },
          is_authenticated: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response.answer || "I couldn't verify this information from the available official sources.",
        sources: data.response.official_sources || [],
        needs_clarification: data.response.needs_clarification,
        clarification_question: data.response.clarification_question,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const fallbackMessage =
        "AI assistance is temporarily unavailable. You can still view the verified service information.";
      // Network-level failures (TypeError) get the friendly fallback message;
      // sanitized server-provided messages pass through to the user.
      if (err instanceof TypeError) {
        setError(fallbackMessage);
      } else if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
    setInput("");
    inputRef.current?.focus();
  };


  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-lg ring-1 ring-teal-900/5 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-b from-teal-50/80 to-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">🤖</span>
          <span className="font-semibold text-slate-900">Ask GovGuide AI</span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearConversation}
            className="text-sm text-slate-600 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 min-h-[200px] max-h-[400px]" role="log" aria-live="polite" aria-label="AI conversation">
        {messages.length === 0 && (
          <div className="py-8 text-center">
            <p className="mb-4 text-slate-600">Ask a question about government services</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="rounded-full border border-teal-200 bg-teal-50/70 px-4 py-2 text-sm font-medium text-teal-900 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-700 hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-4 py-3 ${message.role === "user" ? "brand-gradient rounded-2xl rounded-br-md text-white shadow-md" : "rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 text-slate-900 shadow-xs"}`}>
              <p className="whitespace-pre-line">{message.content}</p>
              {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                <div className="mt-3 border-t border-slate-300 pt-3">
                  <p className="mb-2 text-xs font-semibold text-slate-600">Sources:</p>
                  <div className="space-y-1">
                    {message.sources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm text-teal-800 underline underline-offset-2 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {message.role === "assistant" && message.needs_clarification && message.clarification_question && (
                <div className="mt-3 border-t border-slate-300 pt-3">
                  <p className="text-sm font-medium text-slate-700">{message.clarification_question}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-slate-600" role="status">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4" role="alert">
            <p className="text-sm text-rose-800">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="mt-2 text-sm font-medium text-rose-900 underline underline-offset-2 hover:text-rose-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
            >
              Dismiss
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4">
        <div className="flex gap-3">
          <label htmlFor="ai-input" className="sr-only">Ask a question</label>
          <input
            ref={inputRef}
            id="ai-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this service..."
            disabled={isLoading}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder:text-slate-500 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 focus:outline-none disabled:opacity-50"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? "..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
