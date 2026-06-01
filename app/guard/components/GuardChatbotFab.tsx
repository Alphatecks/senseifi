"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

import senseiLogo from "@/assets/icons/Mono.png";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const WELCOME =
  "Hi — I'm SenseiGuard. Ask about wallet security, threats, approvals, or how to use your dashboard.";

const QUICK_PROMPTS = [
  "What's my security score?",
  "How do I scan a contract?",
  "Explain threat alerts",
];

function replyToUser(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("security score") || q.includes("wallet health")) {
    return "Your security score reflects recent scans, active threats, and risky approvals. Open Security Status on the dashboard or run a full scan for the latest score.";
  }
  if (q.includes("contract") || q.includes("scan")) {
    return "Use Contract Scanner to paste a contract address before you sign. SenseiGuard checks permissions, scam patterns, and trust signals from our API.";
  }
  if (q.includes("threat") || q.includes("alert")) {
    return "Threat Intelligence surfaces phishing patterns, scam signals, and reported domains. Check the Threat Intelligence page or the dashboard card for active items.";
  }
  if (q.includes("approval")) {
    return "Old token approvals can stay active after you stop using a dApp. Review them under Wallet Security → Approval & Permission and revoke what you don't need.";
  }
  if (q.includes("hello") || q.includes("hi")) {
    return "Hello! I'm here to help you stay safe on-chain. Try one of the quick prompts or ask anything about SenseiFi Guard.";
  }
  return "I'm still learning — for now, explore Wallet Security, Threat Intelligence, and Contract Scanner from the sidebar, or run a full wallet scan from the dashboard.";
}

export default function GuardChatbotFab() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: WELCOME },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const botMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: replyToUser(trimmed),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[90] flex flex-col items-end gap-3 pointer-events-none">
      {open ? (
        <div
          className="pointer-events-auto w-[min(100vw-2rem,380px)] rounded-2xl border border-slate-700/60 bg-[#12152a] shadow-2xl shadow-black/50 overflow-hidden flex flex-col"
          style={{ maxHeight: "min(70vh, 520px)" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-blue-950/80 to-slate-900/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative shrink-0 w-9 h-9 rounded-full bg-[#0026FF]/20 border border-[#4066FF]/40 flex items-center justify-center overflow-hidden">
                <Image src={senseiLogo} alt="" width={22} height={22} className="w-5 h-5 object-contain" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#32BB1D] border-2 border-[#12152a]" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">SenseiGuard</p>
                <p className="text-[11px] text-slate-400">AI security assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white rounded-br-md"
                      : "bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-slate-800/80">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="text-[11px] px-2.5 py-1 rounded-full border border-slate-600/50 text-slate-300 hover:text-white hover:border-[#4066FF]/60 hover:bg-[#4066FF]/10 transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="p-3 flex gap-2 border-t border-slate-700/50 bg-[#0d1020]/80"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SenseiGuard…"
              className="flex-1 min-w-0 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 bg-slate-800/60 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-[#4066FF]/40"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-b from-[#4066FF] to-[#0026FF] disabled:opacity-40 transition hover:opacity-90"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#4066FF] to-[#0026FF] text-white shadow-lg shadow-[#0026FF]/30 ring-2 ring-white/10 hover:scale-105 active:scale-95 transition-transform"
        aria-label={open ? "Close SenseiGuard chat" : "Open SenseiGuard chat"}
        aria-expanded={open}
      >
        <span className="absolute inset-0 rounded-full bg-[#4066FF]/40 animate-ping opacity-30 group-hover:opacity-40" aria-hidden />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#32BB1D] border-2 border-[#0a0a1a] z-10" aria-hidden />
        {open ? (
          <svg className="w-6 h-6 relative z-[1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 relative z-[1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>,
    document.body
  );
}
