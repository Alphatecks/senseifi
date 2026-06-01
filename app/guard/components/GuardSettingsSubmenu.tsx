"use client";

import React from "react";
import Image from "next/image";
import userCircleIcon from "@/assets/icons/user-circle (1).png";

export type SettingsSectionId = "profile" | "security" | "subscription" | "support" | "terms";

const ACTIVE_ICON_COLOR = "#0026ff";
const INACTIVE_COLOR = "#515461";

const INACTIVE_ICON_FILTER =
  "brightness(0) saturate(100%) invert(48%) sepia(13%) saturate(800%) hue-rotate(200deg)";
const ACTIVE_ICON_FILTER =
  "brightness(0) saturate(100%) invert(11%) sepia(100%) saturate(5000%) hue-rotate(230deg)";

export const SETTINGS_ICON = (
  <svg className="w-6 h-6 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PROFILE_ICON = (active: boolean) => (
  <span className="inline-flex shrink-0 w-6 h-6">
    <Image
      src={userCircleIcon}
      alt=""
      width={24}
      height={24}
      className="w-6 h-6 object-contain"
      style={active ? { filter: ACTIVE_ICON_FILTER } : { filter: INACTIVE_ICON_FILTER }}
    />
  </span>
);

const SHIELD_ICON = (active: boolean) => (
  <svg className="w-6 h-6 shrink-0" style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CARD_ICON = (active: boolean) => (
  <svg className="w-6 h-6 shrink-0" style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.5 20a6.5 6.5 0 0113 0M12 12a4 4 0 100-8 4 4 0 000 8z" />
    <circle cx="12" cy="12" r="10" strokeWidth={1.8} />
  </svg>
);

const SUPPORT_ICON = (active: boolean) => (
  <svg className="w-6 h-6 shrink-0" style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 18v-6a9 9 0 0118 0v6" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
  </svg>
);

const DOCUMENT_ICON = (active: boolean) => (
  <svg className="w-6 h-6 shrink-0" style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SIGNOUT_ICON = (
  <svg className="w-6 h-6 shrink-0" style={{ color: INACTIVE_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export const SETTINGS_NAV_ITEMS: Array<{
  id: SettingsSectionId;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}> = [
  { id: "profile", label: "Profile Settings", icon: PROFILE_ICON },
  { id: "security", label: "Security Preferences", icon: SHIELD_ICON },
  { id: "subscription", label: "Subscription & Billing", icon: CARD_ICON },
  { id: "support", label: "Support & Feedback", icon: SUPPORT_ICON },
  { id: "terms", label: "Terms & Privacy Policy", icon: DOCUMENT_ICON },
];

export function parseSettingsSection(value: string | null | undefined): SettingsSectionId {
  if (value && SETTINGS_NAV_ITEMS.some((item) => item.id === value)) {
    return value as SettingsSectionId;
  }
  return "profile";
}

type GuardSettingsSubmenuProps = {
  activeSection: SettingsSectionId;
  onSelectSection: (section: SettingsSectionId) => void;
  onSignOut?: () => void;
  variant?: "sidebar" | "drawer";
  onClose?: () => void;
  onBack?: () => void;
  showCloseButton?: boolean;
};

export default function GuardSettingsSubmenu({
  activeSection,
  onSelectSection,
  onSignOut,
  variant = "sidebar",
  onClose,
  onBack,
  showCloseButton = false,
}: GuardSettingsSubmenuProps) {
  const isDrawer = variant === "drawer";

  const nav = (
    <nav className={`${isDrawer ? "px-4 py-2" : "p-3"} space-y-1 overflow-y-auto flex-1 min-h-0`}>
      {SETTINGS_NAV_ITEMS.map((item) => {
        const active = activeSection === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left font-medium transition ${
              active ? "border border-slate-600/60" : "hover:bg-slate-800/40"
            }`}
            style={
              active
                ? {
                    backgroundColor: "rgba(30, 32, 50, 0.8)",
                    color: "#fff",
                    boxShadow:
                      "inset 2px 2px 8px rgba(0, 38, 255, 0.35), inset 1px 0 5px rgba(0, 38, 255, 0.2), inset 0 1px 5px rgba(0, 38, 255, 0.2)",
                  }
                : { color: INACTIVE_COLOR }
            }
          >
            {item.icon(active)}
            <span style={active ? { color: "#fff" } : { color: INACTIVE_COLOR }}>{item.label}</span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={onSignOut}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left font-medium hover:bg-slate-800/40 transition"
        style={{ color: INACTIVE_COLOR }}
      >
        {SIGNOUT_ICON}
        <span>Sign Out</span>
      </button>
    </nav>
  );

  const header = (
    <div className={`flex items-center justify-between shrink-0 ${isDrawer ? "px-4 pt-2 pb-4" : "px-5 pt-6 pb-4"}`}>
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg shrink-0"
            aria-label="Back to menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {SETTINGS_ICON}
        <h1 className={`${isDrawer ? "text-xl" : "text-lg"} font-semibold text-white truncate`}>Settings</h1>
      </div>
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-lg shrink-0"
          aria-label="Close menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );

  if (isDrawer) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-[#0a0a1a]">
        {header}
        {nav}
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-slate-700/60 overflow-hidden flex flex-col flex-1 min-h-0 opacity-90"
      style={{ backgroundColor: "#242636" }}
    >
      {header}
      {nav}
    </div>
  );
}
