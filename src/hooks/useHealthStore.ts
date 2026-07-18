"use client";

import { useCallback, useEffect, useState } from "react";
import {
  emptyStore,
  loadStore,
  subscribe,
} from "@/lib/health-storage";
import type { HealthStoreV1 } from "@/types/health";

/**
 * SSR-safe accessor for the local health store.
 *
 * `ready` is false during server render and the first client render, so a
 * component never renders stored health values before hydration — which would
 * cause a mismatch. Once mounted, it loads from localStorage and re-renders on
 * any change (this tab or another). Mutations go through the lib functions in
 * `health-storage`, which dispatch the change event this hook listens for.
 */
export function useHealthStore(): { store: HealthStoreV1; ready: boolean } {
  const [store, setStore] = useState<HealthStoreV1>(emptyStore);
  const [ready, setReady] = useState(false);

  const sync = useCallback(() => setStore(loadStore()), []);

  useEffect(() => {
    sync();
    setReady(true);
    const unsubscribe = subscribe(sync);
    return unsubscribe;
  }, [sync]);

  return { store, ready };
}
