// ═══════════════════════════════════════════════════════════
// useIsPro — kompakter Hook der den Pro-Status für jede Component liefert.
// null = noch lädt, true = Pro, false = Free.
// ═══════════════════════════════════════════════════════════

"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase-client";
import { isPro } from "./premium";

export function useIsPro(): boolean | null {
  const [pro, setPro] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.from("profiles")
        .select("subscription_tier, subscription_status, subscription_period_end, trial_ends_at")
        .single();
      if (!cancelled) setPro(isPro(data));
    })();
    return () => { cancelled = true; };
  }, []);
  return pro;
}
