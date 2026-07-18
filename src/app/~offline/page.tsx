"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";

export default function OfflinePage() {
  const { t } = useLang();
  return (
    <section className="container-x flex min-h-[70dvh] items-center justify-center py-12">
      <div className="card-clinical w-full max-w-2xl p-6 text-center sm:p-10">
        <span className="icon-pad mx-auto h-14 w-14"><Icon name="wifi-off" className="h-7 w-7" /></span>
        <h1 className="mt-5 text-h2 font-bold text-navy-900">{t("أنت غير متصل بالإنترنت", "You’re offline")}</h1>
        <p className="mx-auto mt-3 max-w-xl leading-7 text-navy-600">
          {t(
            "بعض صفحات عيادتنا تحتاج إلى اتصال. يمكنك العودة إلى صفحة محفوظة أو استخدام الأدوات المحلية المتاحة على جهازك.",
            "Some OurClinic pages need a connection. You can return to a saved page or use tools already available on your device.",
          )}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn-primary"><Icon name="refresh" className="h-4 w-4" />{t("إعادة المحاولة", "Retry connection")}</button>
          <Link href="/" className="btn-ghost">{t("الرئيسية", "Go to Home")}</Link>
          <Link href="/health-journey" className="btn-ghost">{t("رفيق صحتك", "Health Companion")}</Link>
          <button type="button" onClick={() => window.history.back()} className="btn-ghost">{t("صفحة محفوظة", "Saved page")}</button>
        </div>
      </div>
    </section>
  );
}
