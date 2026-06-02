"use client";

import React, { useState } from "react";

type LegalTab = "terms" | "privacy";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "1. Acceptance of terms",
    paragraphs: [
      "By accessing or using SenseiFi, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing the service.",
    ],
  },
  {
    title: "2. Permitted use",
    paragraphs: [
      "You may use our service only for lawful purposes and in accordance with these Terms. You agree not to use the service:",
    ],
    bullets: [
      "In any way that violates any applicable federal, state, local, or international law or regulation.",
      "To transmit, or procure the sending of, any advertising or promotional material without our prior written consent.",
      "To impersonate or attempt to impersonate SenseiFi, a SenseiFi employee, another user, or any other person or entity.",
      "To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the service.",
      "To attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the service.",
      "To collect or track the personal information of others without consent.",
    ],
  },
  {
    title: "3. Intellectual property",
    paragraphs: [
      "The service and its original content, features, and functionality are and will remain the exclusive property of SenseiFi and its licensors. The service is protected by copyright, trademark, and other laws.",
    ],
  },
  {
    title: "4. Termination",
    paragraphs: [
      "We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.",
    ],
  },
  {
    title: "5. Limitation of liability",
    paragraphs: [
      "In no event shall SenseiFi, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.",
    ],
  },
];

const PRIVACY_DATA_CARDS = [
  { title: "Account data", description: "Name, email, password" },
  { title: "Usage data", description: "Pages visited, features used" },
  { title: "Device data", description: "IP address, browser, OS" },
  { title: "Communications", description: "Support messages, feedback" },
] as const;

const PRIVACY_RIGHTS = [
  "Right to access your personal data",
  "Right to correct inaccurate information",
  "Right to request deletion of your data",
  "Right to opt out of marketing communications",
  "Right to data portability",
] as const;

const PRIVACY_EFFECTIVE_DATE = "June 1, 2026";

const LEGAL_TABS = [
  { id: "terms" as const, label: "Terms of Services" },
  { id: "privacy" as const, label: "Privacy Policy" },
] as const;

function DocumentIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-[#0026FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

function PrivacyPolicyContent() {
  return (
    <div className="space-y-8 text-sm leading-relaxed text-slate-300">
      <section>
        <h3 className="text-base font-semibold text-white">Data we collect</h3>
        <p className="mt-3">
          We collect information that helps us provide, secure, and improve SenseiFi. The categories below
          describe the main types of data we may process when you use our services.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRIVACY_DATA_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-xl px-5 py-4"
              style={{ backgroundColor: "rgba(0, 38, 255, 0.12)" }}
            >
              <h4 className="text-base font-semibold text-white">{card.title}</h4>
              <p className="mt-2 italic text-slate-400">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">Your rights</h3>
        <p className="mt-3">
          We use the information we collect to operate SenseiFi, deliver security alerts, improve product
          performance, provide customer support, and comply with legal obligations. We do not sell your
          personal data, and we limit access to the information needed to provide our services.
        </p>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">Your rights</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-slate-500">
          {PRIVACY_RIGHTS.map((right) => (
            <li key={right}>{right}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-base font-semibold text-white">Data retention</h3>
        <p className="mt-3">
          We retain personal data only for as long as necessary to fulfill the purposes outlined in this
          policy, unless a longer retention period is required or permitted by law. When data is no longer
          needed, we delete or anonymize it using reasonable security measures.
        </p>
      </section>
    </div>
  );
}

function LegalContent({ sections }: { sections: LegalSection[] }) {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-slate-300">
      {sections.map((section) => (
        <section key={section.title}>
          <h3 className="text-base font-semibold text-white">{section.title}</h3>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="mt-3">
              {paragraph}
            </p>
          ))}
          {section.bullets ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-slate-500">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function LegalTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: LegalTab;
  onTabChange: (tab: LegalTab) => void;
}) {
  return (
    <div className="flex gap-8 border-b border-white/10">
      {LEGAL_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 text-sm font-medium transition ${
              isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <span className="relative inline-block">
              {tab.label}
              {isActive ? (
                <span className="absolute -bottom-3 left-0 right-0 h-0.5 rounded-full bg-[#0026FF]" />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function WarningBanner({ text }: { text: string }) {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-md bg-[#252736] px-4 py-3">
      <WarningIcon />
      <p className="text-sm leading-relaxed text-slate-300">{text}</p>
    </div>
  );
}

function AgreementFooter({
  agreed,
  onAgreedChange,
  statusMessage,
  onSubmit,
  fullWidthSubmit = false,
}: {
  agreed: boolean;
  onAgreedChange: (checked: boolean) => void;
  statusMessage: string | null;
  onSubmit: () => void;
  fullWidthSubmit?: boolean;
}) {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => onAgreedChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#0026FF] bg-transparent text-[#0026FF] focus:ring-[#0026FF]/40"
        />
        <span className="text-sm font-semibold text-white">
          I have read and agree to the terms and condition
        </span>
      </label>

      {statusMessage ? (
        <p
          className={`text-sm ${
            statusMessage.startsWith("Your agreement") ? "text-green-300" : "text-red-300"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        className={
          fullWidthSubmit
            ? "w-full rounded-xl py-3.5 text-sm font-semibold text-white transition hover:opacity-90 bg-gradient-to-b from-[#4066FF] to-[#0026FF] hover:from-[#3355FF] hover:to-[#001fcc] shadow-[0_4px_12px_rgba(0,38,255,0.25)] ring-1 ring-inset ring-[#4066FF]/90"
            : "rounded-md bg-[#0026FF] px-8 py-2.5 text-sm font-medium text-white transition hover:bg-[#0020dd]"
        }
      >
        Submit
      </button>
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: LegalTab }) {
  return activeTab === "terms" ? (
    <LegalContent sections={TERMS_SECTIONS} />
  ) : (
    <PrivacyPolicyContent />
  );
}

export default function TermsPrivacySection() {
  const [activeTab, setActiveTab] = useState<LegalTab>("terms");
  const [agreed, setAgreed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!agreed) {
      setStatusMessage("Please confirm that you have read and agree to the terms and conditions.");
      return;
    }

    setStatusMessage("Your agreement has been recorded. Thank you.");
  };

  const handleAgreedChange = (checked: boolean) => {
    setAgreed(checked);
    if (checked) setStatusMessage(null);
  };

  const handleTabChange = (tab: LegalTab) => {
    setActiveTab(tab);
    setStatusMessage(null);
  };

  const warningText =
    activeTab === "terms"
      ? "Please read these terms carefully before using our services. By accessing or using the service you agree to be bound by these terms."
      : `Effective date: ${PRIVACY_EFFECTIVE_DATE}`;

  return (
    <>
      {/* Mobile */}
      <div
        className="relative flex min-h-[calc(100dvh-4rem)] w-full flex-1 flex-col lg:hidden"
        style={{ backgroundColor: "#0c1129" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#0026FF]/25 to-transparent"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pt-2">
          <LegalTabs activeTab={activeTab} onTabChange={handleTabChange} />
          <WarningBanner text={warningText} />

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto pb-4 pr-1">
            <TabContent activeTab={activeTab} />
          </div>

          <div
            className="shrink-0 border-t border-white/10 pt-5 pb-8"
            style={{ backgroundColor: "#0c1129" }}
          >
            <AgreementFooter
              agreed={agreed}
              onAgreedChange={handleAgreedChange}
              statusMessage={statusMessage}
              onSubmit={handleSubmit}
              fullWidthSubmit
            />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div
        className="relative hidden h-full min-h-[520px] w-full flex-1 flex-col overflow-hidden rounded-2xl px-8 py-7 lg:flex lg:min-h-0"
        style={{ backgroundColor: "#181b2e" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0026FF]/20 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0026FF]/12 to-transparent"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-2.5">
            <DocumentIcon />
            <h2 className="text-lg font-medium text-white">Terms & Feedback</h2>
          </div>

          <div className="mt-6">
            <LegalTabs activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          <WarningBanner text={warningText} />

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
            <TabContent activeTab={activeTab} />
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <AgreementFooter
              agreed={agreed}
              onAgreedChange={handleAgreedChange}
              statusMessage={statusMessage}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </>
  );
}
