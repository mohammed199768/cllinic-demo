"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";

interface DeferredInstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type InstallContextValue = {
  standalone: boolean;
  canInstall: boolean;
  isIOS: boolean;
  showInstall: () => void;
};

const InstallContext = createContext<InstallContextValue | null>(null);

export function usePWAInstall() {
  const value = useContext(InstallContext);
  if (!value) throw new Error("usePWAInstall must be used within PWAProvider");
  return value;
}

export default function PWAProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLang();
  const [prompt, setPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const reloading = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const detectStandalone = () => {
      const installed =
        media.matches ||
        (window.navigator as Navigator & { standalone?: boolean })
          .standalone === true;
      setStandalone(installed);
      document.documentElement.dataset.standalone = String(installed);
    };
    const ua = navigator.userAgent;
    setIsIOS(
      /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );
    detectStandalone();
    media.addEventListener("change", detectStandalone);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as DeferredInstallPrompt);
    };
    const onInstalled = () => {
      setPrompt(null);
      setInstallOpen(false);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      media.removeEventListener("change", detectStandalone);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => {
      setOnline(true);
      setWasOffline(true);
    };
    const onOffline = () => {
      setOnline(false);
      setWasOffline(true);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") {
      const cleanupReloadKey = "our-clinic:dev-sw-cleanup-reload";
      const shouldReload = Boolean(navigator.serviceWorker.controller) &&
        sessionStorage.getItem(cleanupReloadKey) !== "done";
      if (shouldReload) sessionStorage.setItem(cleanupReloadKey, "done");
      else if (!navigator.serviceWorker.controller) sessionStorage.removeItem(cleanupReloadKey);

      const unregister = navigator.serviceWorker.getRegistrations().then((registrations) =>
        Promise.all(registrations.map((registration) => registration.unregister())),
      );
      const clearCaches = "caches" in window
        ? caches.keys().then((keys) => Promise.all(
            keys
              .filter((key) => key.startsWith("our-clinic-"))
              .map((key) => caches.delete(key)),
          ))
        : Promise.resolve([]);
      void Promise.allSettled([unregister, clearCaches]).then(() => {
        if (shouldReload) window.location.reload();
      });
      return;
    }
    sessionStorage.removeItem("our-clinic:dev-sw-cleanup-reload");
    const hadController = Boolean(navigator.serviceWorker.controller);
    let active = true;
    let stopWatching: () => void = () => undefined;
    const watch = (reg: ServiceWorkerRegistration) => {
      if (reg.waiting && navigator.serviceWorker.controller)
        setWaiting(reg.waiting);
      let stopWorker: () => void = () => undefined;
      const onUpdateFound = () => {
        const worker = reg.installing;
        if (!worker) return;
        const onStateChange = () => {
          if (
            worker.state === "installed" &&
            navigator.serviceWorker.controller
          )
            setWaiting(worker);
        };
        worker.addEventListener("statechange", onStateChange);
        stopWorker = () => worker.removeEventListener("statechange", onStateChange);
      };
      reg.addEventListener("updatefound", onUpdateFound);
      return () => {
        reg.removeEventListener("updatefound", onUpdateFound);
        stopWorker();
      };
    };
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (active) stopWatching = watch(registration);
      })
      .catch(() => undefined);
    const onController = () => {
      if (!hadController) return;
      if (reloading.current) return;
      reloading.current = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onController);
    return () => {
      active = false;
      stopWatching();
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onController,
      );
    };
  }, []);

  const showInstall = useCallback(() => setInstallOpen(true), []);
  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "dismissed")
      localStorage.setItem(
        "our-clinic-install-dismissed",
        new Date().toISOString(),
      );
    setPrompt(null);
    setInstallOpen(false);
  };
  const update = () => waiting?.postMessage({ type: "SKIP_WAITING" });
  const value = useMemo(
    () => ({
      standalone,
      canInstall: !standalone && (!!prompt || isIOS),
      isIOS,
      showInstall,
    }),
    [standalone, prompt, isIOS, showInstall],
  );

  return (
    <InstallContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[calc(4rem+env(safe-area-inset-top,0px))] z-[850] flex justify-center px-4"
      >
        {!online && (
          <div className="pointer-events-auto rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-float">
            {t("لا يوجد اتصال بالإنترنت", "You’re offline")}
          </div>
        )}
        {online && wasOffline && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-mint-500 px-4 py-2 text-sm font-semibold text-white shadow-float">
            <span>{t("عاد الاتصال بالإنترنت", "You’re back online")}</span>
            <button
              onClick={() => window.location.reload()}
              className="underline"
            >
              {t("إعادة المحاولة", "Retry")}
            </button>
          </div>
        )}
      </div>
      {waiting && (
        <div className="fixed inset-x-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] z-[840] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-3 shadow-float lg:bottom-6">
          <p className="text-sm font-semibold text-navy-800">
            {t("يتوفر تحديث جديد للتطبيق", "A new app update is available")}
          </p>
          <button onClick={update} className="btn-primary shrink-0 px-4">
            {t("حدّث الآن", "Update now")}
          </button>
        </div>
      )}
      {installOpen &&
        !standalone &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("تثبيت التطبيق", "Install application")}
            className="fixed inset-0 z-[1200] flex items-end justify-center bg-navy-950/50 p-3 sm:items-center"
            onMouseDown={(e) =>
              e.target === e.currentTarget && setInstallOpen(false)
            }
          >
            <div
              className="w-full max-w-md rounded-3xl bg-white p-5 shadow-float"
              dir={isIOS ? undefined : "auto"}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-navy-900">
                    {t("تثبيت عيادتنا", "Install OurClinic")}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-navy-600">
                    {isIOS
                      ? t(
                          "لإضافة التطبيق إلى الشاشة الرئيسية: افتح زر المشاركة في Safari، اختر «إضافة إلى الشاشة الرئيسية»، ثم اضغط «إضافة».",
                          "To add the app to your Home Screen: open the Share menu in Safari, choose “Add to Home Screen,” then tap “Add.”",
                        )
                      : t(
                          "ثبّت التطبيق للوصول إليه بسرعة من جهازك.",
                          "Install the app for quick access from your device.",
                        )}
                  </p>
                </div>
                <button
                  onClick={() => setInstallOpen(false)}
                  aria-label={t("إغلاق", "Close")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy-700 hover:bg-navy-50"
                >
                  <Icon name="close" />
                </button>
              </div>
              {!isIOS && prompt && (
                <button onClick={install} className="btn-primary mt-5 w-full">
                  <Icon name="download" className="h-4 w-4" />
                  {t("تثبيت التطبيق", "Install app")}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )}
    </InstallContext.Provider>
  );
}
