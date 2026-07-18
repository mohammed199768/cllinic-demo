"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/lib/i18n";
import { usePWAInstall } from "@/components/pwa/PWAProvider";
import {
  isMedicalQuestion,
  isUrgentWording,
  matchIntent,
  rankQuestions,
} from "@/lib/chatbot/matchIntent";
import { telHref } from "@/lib/clinic";
import type { BilingualText, ChatAction, ChatMessage } from "@/types/chatbot";
import { createId } from "@ourclinic/local-data/create-id";
import Icon from "./Icon";

const STARTERS: Record<string, BilingualText[]> = {
  "/services": [
    { ar: "شو خدماتكم", en: "What services do you offer?" },
    { ar: "استفسار عن خدمة", en: "Service enquiry" },
    { ar: "بدي احجز", en: "Book an appointment" },
  ],
  "/health-journey": [
    { ar: "بدي اسجل الضغط", en: "Open blood pressure log" },
    { ar: "بدي اسجل السكر", en: "Track blood glucose" },
    { ar: "كيف ارتب ادويتي", en: "Organize my medications" },
    { ar: "بدي اجهز لزيارة الطبيب", en: "Prepare for my appointment" },
  ],
  "/daily-stories": [
    { ar: "قصص يومية", en: "Show daily stories" },
    { ar: "نصائح طبية", en: "Show medical tips" },
    { ar: "بدي اجهز لزيارة الطبيب", en: "Prepare for my appointment" },
  ],
  "/medical-tips": [
    { ar: "نصائح طبية", en: "Show medical tips" },
    { ar: "شو رفيق صحتك", en: "What is Health Companion?" },
    { ar: "بدي احجز", en: "Book an appointment" },
  ],
  "/booking": [
    { ar: "كيف احجز موعد", en: "How do I book?" },
    { ar: "رقم التلفون", en: "Phone number" },
    { ar: "بدي اجهز لزيارة الطبيب", en: "Prepare for my appointment" },
  ],
  "/contact": [
    { ar: "رقم التلفون", en: "Phone number" },
    { ar: "واتساب", en: "Open WhatsApp" },
    { ar: "وين العيادة", en: "Where is the clinic?" },
  ],
};
const DEFAULT_STARTERS: BilingualText[] = [
  { ar: "شو خدماتكم", en: "What services do you offer?" },
  { ar: "بدي احجز", en: "Book an appointment" },
  { ar: "شو رفيق صحتك", en: "What is Health Companion?" },
  { ar: "كيف انزل التطبيق", en: "Install the app" },
];
const SESSION_KEY = "our-clinic-guide-session-v1";

export default function HereAssistantWidget() {
  const { lang, setLang, t } = useLang();
  const { showInstall } = usePWAInstall();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const panel = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const suggestions = useMemo(
    () => rankQuestions(input, lang, pathname),
    [input, lang, pathname],
  );
  const starters =
    STARTERS[pathname] ??
    (pathname.startsWith("/health-journey")
      ? STARTERS["/health-journey"]
      : DEFAULT_STARTERS);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) setMessages(JSON.parse(saved) as ChatMessage[]);
    } catch {
      /* Ignore unavailable session storage. */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch {
      /* Session persistence is optional. */
    }
  }, [messages]);

  const close = useCallback(() => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("our-clinic-guide-closed"));
    requestAnimationFrame(() => launcher.current?.focus());
  }, []);
  const openGuide = useCallback(() => {
    setOpen(true);
    window.dispatchEvent(new CustomEvent("our-clinic-guide-opened"));
  }, []);
  useEffect(() => {
    window.addEventListener("our-clinic-guide-open", openGuide);
    return () => window.removeEventListener("our-clinic-guide-open", openGuide);
  }, [openGuide]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    const focusable = () =>
      Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          "a,button:not([disabled]),input",
        ) ?? [],
      );
    const keydown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        if (suggestions.length) {
          setInput("");
          return;
        }
        close();
      }
      if (event.key === "Tab") {
        const items = focusable();
        if (!items.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", keydown);
    };
  }, [open, close, suggestions.length]);

  const addGuide = (
    text: string,
    actions?: ChatAction[],
    followUps?: BilingualText[],
  ) => {
    const id = createId();
    setMessages((current) => [
      ...current,
      { id, from: "guide", text, actions, followUps },
    ]);
  };
  const submitQuestion = (question: string) => {
    const clean = question.trim();
    if (!clean) return;
    const id = createId();
    setMessages((current) => [
      ...current,
      { id, from: "user", text: clean },
    ]);
    setInput("");
    setActiveSuggestion(-1);
    if (isUrgentWording(clean)) {
      addGuide(
        t(
          "لا يجري دليل عيادتنا فرزًا طبيًا. إذا كنت تحتاج مساعدة فورية، تواصل مع خدمات الطوارئ المحلية أو اتصل بالعيادة. لا تؤخر طلب المساعدة بسبب هذا الدليل.",
          "OurClinic Guide does not perform triage. If you need immediate help, contact local emergency services or call the clinic. Do not delay seeking help because of this Guide.",
        ),
        [
          {
            label: { ar: "اتصل بالعيادة", en: "Call clinic" },
            href: telHref,
            kind: "external",
          },
          {
            label: { ar: "معلومات الرعاية", en: "Care information" },
            href: "/emergency",
            kind: "route",
          },
        ],
      );
      return;
    }
    const result = matchIntent(clean, lang, pathname);
    if (result.intent && result.confidence >= 0.72) {
      addGuide(
        result.intent.response[lang],
        result.intent.actions,
        result.intent.followUps,
      );
      return;
    }
    if (isMedicalQuestion(clean)) {
      addGuide(
        t(
          "لا يستطيع دليل عيادتنا تشخيص الأعراض. يمكنك قراءة المحتوى التوعوي أو حجز موعد لمناقشة حالتك مع مختص.",
          "OurClinic Guide cannot diagnose symptoms. You can browse educational content or book an appointment to discuss your concerns with a professional.",
        ),
        [
          {
            label: { ar: "حجز موعد", en: "Book appointment" },
            href: "/booking",
            kind: "route",
          },
          {
            label: { ar: "محتوى توعوي", en: "Educational content" },
            href: "/medical-tips",
            kind: "route",
          },
          {
            label: { ar: "تواصل مع العيادة", en: "Contact clinic" },
            href: "/contact",
            kind: "route",
          },
        ],
      );
      return;
    }
    if (result.intent && result.confidence >= 0.48) {
      const choices = [result.intent, ...result.alternatives].slice(0, 3);
      addGuide(
        t("هل تقصد أحد هذه الخيارات؟", "Did you mean one of these options?"),
        undefined,
        choices.map((intent) => ({
          ar: intent.aliases.ar[0],
          en: intent.aliases.en[0],
        })),
      );
      return;
    }
    addGuide(
      t(
        "لم أجد إجابة مؤكدة لهذا السؤال، لكن قد تكون إحدى هذه الصفحات مفيدة.",
        "I couldn’t find a verified answer to that question, but one of these pages may help.",
      ),
      [
        {
          label: { ar: "الخدمات", en: "Services" },
          href: "/services",
          kind: "route",
        },
        {
          label: { ar: "حجز موعد", en: "Booking" },
          href: "/booking",
          kind: "route",
        },
        {
          label: { ar: "تواصل معنا", en: "Contact" },
          href: "/contact",
          kind: "route",
        },
      ],
    );
  };
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitQuestion(input);
  };
  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((value) => (value + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((value) =>
        value <= 0 ? suggestions.length - 1 : value - 1,
      );
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      submitQuestion(suggestions[activeSuggestion][lang]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setInput("");
      setActiveSuggestion(-1);
    }
  };
  const actionClick = (action: ChatAction) => {
    if (action.kind === "install") showInstall();
    if (action.kind === "language" && action.value) setLang(action.value);
  };
  const clear = () => {
    setMessages([]);
    sessionStorage.removeItem(SESSION_KEY);
    inputRef.current?.focus();
  };

  return (
    <>
      <button
        ref={launcher}
        type="button"
        onClick={openGuide}
        aria-haspopup="dialog"
        aria-label={t("فتح دليل عيادتنا", "Open OurClinic Guide")}
        className="fixed bottom-5 z-40 hidden items-center gap-2 rounded-full bg-navy-900 px-4 py-3 text-white shadow-float transition hover:bg-navy-800 lg:flex ltr:right-5 rtl:left-5"
      >
        <Icon name="navigation" className="h-5 w-5 text-cyan-300" />
        <span className="text-sm font-bold">
          {t("دليل عيادتنا", "OurClinic Guide")}
        </span>
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[1100] flex items-end justify-center bg-navy-950/50 lg:items-center lg:p-5"
            onMouseDown={(event) =>
              event.target === event.currentTarget && close()
            }
          >
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-labelledby="guide-title"
              className="flex h-[min(92dvh,760px)] w-full flex-col overflow-hidden rounded-t-[2rem] bg-cloud shadow-float sm:max-w-2xl lg:rounded-[2rem]"
            >
              <header className="flex items-center justify-between gap-3 border-b border-navy-100 bg-white px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top,0px))] sm:px-5">
                <div className="min-w-0">
                  <h2 id="guide-title" className="font-bold text-navy-900">
                    {t("دليل عيادتنا", "OurClinic Guide")}
                  </h2>
                  <p className="truncate text-xs text-navy-500">
                    {t(
                      "دليلك السريع للخدمات والمواعيد والأدوات",
                      "Your quick guide to services, appointments, and tools",
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={clear}
                    className="min-h-11 rounded-full px-3 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                  >
                    {t("مسح المحادثة", "Clear")}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    aria-label={t("إغلاق", "Close")}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-navy-700 hover:bg-navy-50"
                  >
                    <Icon name="close" />
                  </button>
                </div>
              </header>
              <div
                className="flex-1 overflow-y-auto px-4 py-4 sm:px-5"
                aria-live="polite"
              >
                {messages.length === 0 ? (
                  <div className="mx-auto max-w-xl">
                    <span className="icon-pad h-12 w-12">
                      <Icon name="navigation" className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-navy-900">
                      {t("كيف يمكنني مساعدتك؟", "How can I help?")}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-navy-600">
                      {t(
                        "دليل عيادتنا يساعدك في الوصول إلى المعلومات والصفحات، ولا يقدم تشخيصًا طبيًا.",
                        "OurClinic Guide helps you find information and pages. It does not provide medical diagnosis.",
                      )}
                    </p>
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {starters.slice(0, 6).map((starter) => (
                        <button
                          key={starter.en}
                          type="button"
                          onClick={() => submitQuestion(starter[lang])}
                          className="min-h-12 rounded-2xl border border-navy-100 bg-white px-4 py-3 text-start text-sm font-semibold text-navy-700 shadow-xs transition hover:border-brand-200 hover:text-brand-700"
                        >
                          {starter[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[88%] ${message.from === "user" ? "rounded-2xl rounded-ee-md bg-brand-600 px-4 py-2.5 text-white" : "text-navy-700"}`}
                        >
                          <p className="text-sm leading-7">{message.text}</p>
                          {message.actions && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.actions.map((action, index) =>
                                action.href ? (
                                  action.kind === "external" ? (
                                    <a
                                      key={index}
                                      href={action.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-ghost min-h-11 px-4 text-xs"
                                    >
                                      {action.label[lang]}
                                    </a>
                                  ) : (
                                    <Link
                                      key={index}
                                      href={action.href}
                                      onClick={close}
                                      className="btn-ghost min-h-11 px-4 text-xs"
                                    >
                                      {action.label[lang]}
                                    </Link>
                                  )
                                ) : (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => actionClick(action)}
                                    className="btn-ghost min-h-11 px-4 text-xs"
                                  >
                                    {action.label[lang]}
                                  </button>
                                ),
                              )}
                            </div>
                          )}
                          {message.followUps && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {message.followUps.map((reply) => (
                                <button
                                  key={reply.en}
                                  type="button"
                                  onClick={() => submitQuestion(reply[lang])}
                                  className="min-h-11 rounded-full bg-brand-50 px-4 text-xs font-semibold text-brand-700"
                                >
                                  {reply[lang]}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <form
                onSubmit={onSubmit}
                className="relative border-t border-navy-100 bg-white px-3 pb-[max(.75rem,env(safe-area-inset-bottom,0px))] pt-3 sm:px-5"
              >
                <label htmlFor="guide-input" className="sr-only">
                  {t("اكتب سؤالك", "Type your question")}
                </label>
                {suggestions.length > 0 && (
                  <div
                    id={listId}
                    role="listbox"
                    className="absolute inset-x-3 bottom-full mb-2 max-h-64 overflow-y-auto rounded-2xl border border-navy-100 bg-white p-1.5 shadow-float sm:inset-x-5"
                  >
                    <p className="sr-only" aria-live="polite">
                      {t(
                        `${suggestions.length} اقتراحات`,
                        `${suggestions.length} suggestions`,
                      )}
                    </p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        id={`${listId}-${index}`}
                        key={suggestion.intent.id}
                        type="button"
                        role="option"
                        aria-selected={index === activeSuggestion}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => submitQuestion(suggestion[lang])}
                        className={`flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3 text-start text-sm ${index === activeSuggestion ? "bg-brand-50 text-brand-700" : "text-navy-700 hover:bg-navy-50"}`}
                      >
                        <span>{suggestion[lang]}</span>
                        <span className="text-[10px] text-navy-400">
                          {suggestion.intent.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-2xl border border-navy-200 bg-cloud p-1.5 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
                  <input
                    ref={inputRef}
                    id="guide-input"
                    value={input}
                    onChange={(event) => {
                      setInput(event.target.value);
                      setActiveSuggestion(-1);
                    }}
                    onKeyDown={onInputKeyDown}
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={suggestions.length > 0}
                    aria-controls={suggestions.length ? listId : undefined}
                    aria-activedescendant={
                      activeSuggestion >= 0
                        ? `${listId}-${activeSuggestion}`
                        : undefined
                    }
                    autoComplete="off"
                    placeholder={t(
                      "اسأل عن خدمة أو صفحة...",
                      "Ask about a service or page...",
                    )}
                    className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-navy-900 outline-none placeholder:text-navy-400"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label={t("إرسال", "Send")}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Icon name="send" className="h-5 w-5 rtl:rotate-180" />
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] leading-4 text-navy-400">
                  {t(
                    "المحادثة محلية في هذه الجلسة ولا تُرسل إلى المركز.",
                    "This conversation stays local to this session and is not sent to the center.",
                  )}
                </p>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
