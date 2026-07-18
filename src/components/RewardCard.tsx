"use client";
import { useRef } from "react";
import QRCode from "react-qr-code";
import { useLang } from "@/lib/i18n";
import { CLINIC } from "@/lib/clinic";
import Icon from "./Icon";

export default function RewardCard({
  childName,
  gameName,
  score,
}: {
  childName: string;
  gameName: { ar: string; en: string };
  score?: string;
}) {
  const { lang, t } = useLang();
  const qrRef = useRef<HTMLDivElement>(null);

  const msgAr =
    "حصل صغيرنا الذكي على بطاقة تشجيعية من عيادتنا — يمكنك عرضها خلال الزيارة.";
  const msgEn =
    "Your smart little one earned an encouragement card from OurClinic — you can show it during the visit.";

  const qrValue = JSON.stringify({
    type: "kids-reward",
    childName,
    game: gameName.en,
    score: score ?? "",
    center: "OurClinic",
  });

  const download = () => {
    const svg = qrRef.current?.querySelector("svg");
    const W = 900, H = 1160;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#eaf3ff"); grad.addColorStop(1, "#effcf6");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 50, 50, W - 100, H - 100, 48); ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "#1c61d4";
    ctx.font = "bold 54px system-ui, sans-serif";
    ctx.fillText("🌟", W / 2, 180);
    ctx.font = "bold 46px system-ui, sans-serif";
    ctx.fillText(lang === "ar" ? "بطاقة تشجيعية" : "Encouragement Card", W / 2, 260);
    ctx.fillStyle = "#0f1f33";
    ctx.font = "bold 60px system-ui, sans-serif";
    ctx.fillText(childName || (lang === "ar" ? "صديقنا" : "Friend"), W / 2, 360);
    ctx.fillStyle = "#26a37f";
    ctx.font = "600 38px system-ui, sans-serif";
    ctx.fillText(lang === "ar" ? gameName.ar : gameName.en, W / 2, 430);

    const drawQrThenSave = () => {
      ctx.fillStyle = "#475569";
      ctx.font = "500 30px system-ui, sans-serif";
      wrapText(ctx, lang === "ar" ? msgAr : msgEn, W / 2, 920, W - 220, 42);
      ctx.fillStyle = "#1c61d4";
      ctx.font = "bold 30px system-ui, sans-serif";
      ctx.fillText(CLINIC.name[lang], W / 2, 1080);
      const a = document.createElement("a");
      a.download = `reward-${(childName || "child").replace(/\s+/g, "-")}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };

    if (svg) {
      const xml = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, W / 2 - 150, 500, 300, 300);
        drawQrThenSave();
      };
      img.onerror = drawQrThenSave;
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
    } else {
      drawQrThenSave();
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-brand-50 to-mint-50 p-6 text-center shadow-float">
        <div className="text-5xl">🌟</div>
        <p className="mt-1 text-sm font-bold text-brand-600">{t("بطاقة تشجيعية", "Encouragement Card")}</p>
        <h3 className="mt-2 text-2xl font-extrabold text-ink">{childName || t("صديقنا", "Friend")}</h3>
        <p className="text-sm font-semibold text-mint-500">{lang === "ar" ? gameName.ar : gameName.en}</p>
        <div ref={qrRef} className="mx-auto mt-4 w-fit rounded-2xl bg-white p-3 shadow-soft">
          <QRCode value={qrValue} size={140} />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-600">{lang === "ar" ? msgAr : msgEn}</p>
        <p className="mt-2 text-xs font-bold text-brand-700">{CLINIC.name[lang]}</p>
      </div>
      <button onClick={download} className="btn-primary mt-4 w-full">
        <Icon name="download" className="h-5 w-5" /> {t("حمّل البطاقة", "Download Card")}
      </button>
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
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
