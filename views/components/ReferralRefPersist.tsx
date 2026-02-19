"use client";

import { useEffect } from "react";

/**
 * Persists ?ref= from the current URL to sessionStorage (senseifi_ref) on any page load.
 * So when a user lands on any route with a referral link, the ref is stored and will
 * be picked up when they submit the waitlist form.
 */
export default function ReferralRefPersist() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ref = new URLSearchParams(window.location.search).get("ref")?.trim();
    if (ref) {
      console.log("Referral code from URL:", ref);
      try {
        sessionStorage.setItem("senseifi_ref", ref);
      } catch {
        /* ignore */
      }
    }
  }, []);
  return null;
}
