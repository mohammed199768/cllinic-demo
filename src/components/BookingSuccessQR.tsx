"use client";
import { useRef } from "react";
import QRCode from "react-qr-code";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

export type BookingSummary = {
  bookingId: string;
  firstName: string;
  service: string;
  date: string;
  time: string;
};

export default function BookingSuccessQR({ summary }: { summary: BookingSummary }) {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  // QR contains ONLY non-sensitive booking fields (no phone / no condition)
  const qrValue = JSON.stringify(summary);

  const download = () => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 480; canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 480, 480);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 40, 40, 400, 400);
      const a = document.createElement("a");
      a.download = `booking-${summary.bookingId}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={ref} className="rounded-2xl bg-white p-3 shadow-soft">
        <QRCode value={qrValue} size={156} />
      </div>
      <button onClick={download} className="btn-ghost mt-3 text-sm">
        <Icon name="download" className="h-4 w-4" /> {t("تحميل رمز QR", "Download QR")}
      </button>
    </div>
  );
}
