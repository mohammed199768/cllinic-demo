"use client";
import { useState } from "react";
import { CLINIC } from "@/lib/clinic";
import { useLang } from "@/lib/i18n";
import Icon from "./Icon";

export default function GoogleMapBlock() {
  const { t, lang } = useLang();
  const [load, setLoad] = useState(false);
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
      <div className="relative aspect-[16/10] w-full bg-brand-50">
        {load ? (
          <iframe
            title={t("خريطة عامة لعمّان، الأردن", "General map of Amman, Jordan")}
            src={CLINIC.mapsEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setLoad(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-3 text-brand-700"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-soft">
              <Icon name="pin" className="h-7 w-7" />
            </span>
            <span className="text-sm font-semibold">
              {t("اضغط لعرض الخريطة", "Tap to load the map")}
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">{lang === "ar" ? CLINIC.address.ar : CLINIC.address.en}</p>
        <a href={CLINIC.maps} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <Icon name="arrow" className="h-5 w-5" />
          {t("افتح الاتجاهات", "Get Directions")}
        </a>
      </div>
    </div>
  );
}
