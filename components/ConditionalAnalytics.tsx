"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { readConsent, onConsentChange } from "@/lib/consent";

export default function ConditionalAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(readConsent() === "all");
    return onConsentChange((v) => setEnabled(v === "all"));
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}
