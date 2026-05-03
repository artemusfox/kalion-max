"use client";

import { usePresenceHeartbeat } from "@/lib/presence";

export default function PresenceHeartbeat() {
  usePresenceHeartbeat();
  return null;
}
