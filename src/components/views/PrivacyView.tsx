"use client";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/PageHeader";
import SectionShell from "@/components/SectionShell";
import DisclaimerNote from "@/components/DisclaimerNote";

export default function PrivacyView() {
  const { lang } = useLang();
  const points = [
    { ar: "تُستخدم بيانات النماذج المُرسلة للتواصل معك بخصوص طلبك أو استفسارك فقط.", en: "Form submissions are used only to contact you about your request or inquiry." },
    { ar: "الحجز عبر الموقع هو طلب وليس تأكيداً طبياً نهائياً؛ نتواصل معك لتأكيد الموعد.", en: "Booking through the website is a request, not a final medical confirmation; we contact you to confirm." },
    { ar: "لا ترسل تفاصيل حالات الطوارئ المهددة للحياة عبر النماذج — اتصل بخدمات الطوارئ المحلية فوراً.", en: "Do not submit life-threatening emergency details through forms - call local emergency services immediately." },
    { ar: "رموز QR التي تُنشأ داخل المتصفح قد تحتوي على تفاصيل حجز محدودة (مثل رقم الحجز والاسم الأول والخدمة والموعد) ولا تتضمّن رقم هاتفك أو وصف حالتك.", en: "QR codes generated client-side may contain limited booking details (such as booking ID, first name, service and appointment) and do not include your phone number or condition description." },
    { ar: "جميع المحتويات الطبية في الموقع لأغراض تثقيفية عامة فقط ولا تُعدّ تشخيصاً.", en: "All medical content on the site is for general education only and is not a diagnosis." },
  ];
  return (
    <>
      <PageHeader ar="سياسة الخصوصية" en="Privacy Policy" icon="shield" />
      <SectionShell>
        <div className="mx-auto max-w-3xl space-y-4">
          {points.map((p, i) => (
            <div key={i} className="card p-5 text-sm leading-relaxed text-slate-700">{lang === "ar" ? p.ar : p.en}</div>
          ))}
          <DisclaimerNote />
        </div>
      </SectionShell>
    </>
  );
}
