"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { useLang } from "@/lib/i18n";
import { IqResult } from "@/lib/logicalIqScoring";
import Icon from "@/components/Icon";

/**
 * Premium ivory "Know Yourself" result card with a privacy-safe QR and an image
 * download. The QR contains only non-sensitive summary fields.
 */
export default function IqCertificateCard({
  name,
  result,
  dateLabel,
}: {
  name: string;
  result: IqResult;
  dateLabel: string;
}) {
  const { lang, t } = useLang();
  const qrRef = useRef<HTMLDivElement>(null);

  const displayName = name.trim() || t("زائر", "Guest");
  const tierLabel = lang === "ar" ? result.tier.label.ar : result.tier.label.en;
  const cardLine =
    lang === "ar" ? result.tier.cardLine.ar : result.tier.cardLine.en;

  // Privacy-safe QR payload — no answers, no phone, no medical/personal data.
  const qrValue = JSON.stringify({
    assessment: "logical-iq",
    resultLabel: result.tier.label.en,
    scorePercent: result.percent,
    date: dateLabel,
    path: "/know-yourself/iq-test",
  });

  const download = () => {
    const svg = qrRef.current?.querySelector("svg");
    const W = 900;
    const H = 1180;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ivory background
    ctx.fillStyle = "#FBF8F2";
    ctx.fillRect(0, 0, W, H);

    // pearl panel + medical-blue thin border
    roundRect(ctx, 48, 48, W - 96, H - 96, 40);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 2;
    ctx.stroke();
    roundRect(ctx, 64, 64, W - 128, H - 128, 32);
    ctx.strokeStyle = "#E6DED2";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = "center";

    ctx.fillStyle = "#2563EB";
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillText("OURCLINIC", W / 2, 150);

    ctx.fillStyle = "#10203A";
    ctx.font = "bold 44px system-ui, sans-serif";
    ctx.fillText(
      lang === "ar" ? "بطاقة اعرف نفسك" : "Know Yourself Card",
      W / 2,
      220,
    );

    ctx.fillStyle = "#10203A";
    ctx.font = "bold 56px system-ui, sans-serif";
    ctx.fillText(displayName, W / 2, 318);

    ctx.fillStyle = "#2563EB";
    ctx.font = "600 38px system-ui, sans-serif";
    ctx.fillText(tierLabel, W / 2, 388);

    ctx.fillStyle = "#10203A";
    ctx.font = "bold 116px system-ui, sans-serif";
    ctx.fillText(`${result.percent}%`, W / 2, 545);
    ctx.fillStyle = "#5F6B7A";
    ctx.font = "500 28px system-ui, sans-serif";
    ctx.fillText(
      lang === "ar" ? "مؤشر المنطق البصري" : "Visual Logic Index",
      W / 2,
      595,
    );

    const finish = () => {
      ctx.fillStyle = "#0F766E";
      ctx.font = "600 30px system-ui, sans-serif";
      ctx.fillText(cardLine, W / 2, 905);

      ctx.fillStyle = "#5F6B7A";
      ctx.font = "500 26px system-ui, sans-serif";
      wrapText(
        ctx,
        lang === "ar" ? result.tier.message.ar : result.tier.message.en,
        W / 2,
        955,
        W - 240,
        38,
      );

      ctx.fillStyle = "#2563EB";
      ctx.font = "600 23px system-ui, sans-serif";
      ctx.fillText(
        lang === "ar"
          ? "من عيادتنا — مساحة تفاعلية للتثقيف والاكتشاف الذاتي."
          : "From OurClinic — an interactive space for learning and self-discovery.",
        W / 2,
        1085,
      );
      ctx.fillStyle = "#9AA4B2";
      ctx.font = "500 22px system-ui, sans-serif";
      ctx.fillText(dateLabel, W / 2, 1120);

      const a = document.createElement("a");
      a.download = `know-yourself-${displayName.replace(/\s+/g, "-")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };

    if (svg) {
      const xml = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        roundRect(ctx, W / 2 - 92, 648, 184, 184, 16);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.strokeStyle = "#E6DED2";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.drawImage(img, W / 2 - 78, 662, 156, 156);
        finish();
      };
      img.onerror = finish;
      img.src =
        "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    } else {
      finish();
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[#2563EB]/30 bg-white p-6 text-center shadow-[0_24px_60px_-32px_rgba(16,32,58,0.4)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#10203A_1px,transparent_1px),linear-gradient(90deg,#10203A_1px,transparent_1px)] [background-size:26px_26px]" />
        <div className="relative rounded-[1.4rem] border border-[#E6DED2] p-5">
          <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-[#2563EB]">
            OURCLINIC
          </p>
          <p className="mt-2 text-sm font-bold text-[#10203A]">
            {t("بطاقة اعرف نفسك", "Know Yourself Card")}
          </p>
          <h3 className="mt-3 text-2xl font-extrabold text-[#10203A]">
            {displayName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#2563EB]">
            {tierLabel}
          </p>

          <div className="my-4 flex items-center justify-center gap-2">
            <span className="text-4xl font-extrabold text-[#10203A]">
              {result.percent}%
            </span>
            <span className="text-xs font-medium text-[#5F6B7A]">
              {t("مؤشر المنطق البصري", "Visual Logic Index")}
            </span>
          </div>

          <p className="mb-3 text-sm font-semibold text-[#0F766E]">
            {cardLine}
          </p>

          <div
            ref={qrRef}
            className="mx-auto w-fit rounded-2xl border border-[#E6DED2] bg-white p-2.5"
          >
            <QRCode value={qrValue} size={120} />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#5F6B7A]">
            {lang === "ar" ? result.tier.message.ar : result.tier.message.en}
          </p>
          <p className="mt-3 text-[0.7rem] font-medium text-[#2563EB]">
            {t(
              "من عيادتنا — مساحة تفاعلية للتثقيف والاكتشاف الذاتي.",
              "From OurClinic — an interactive space for learning and self-discovery.",
            )}
          </p>
          <p className="mt-1 text-[0.7rem] text-[#9AA4B2]">{dateLabel}</p>
        </div>
      </div>

      <button
        onClick={download}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(37,99,235,0.7)] transition hover:bg-[#1d4ed8]"
      >
        <Icon name="download" className="h-5 w-5" />
        {t("حمّل البطاقة", "Download Card")}
      </button>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, yy);
      line = w + " ";
      yy += lineHeight;
    } else line = test;
  }
  ctx.fillText(line.trim(), x, yy);
}
