"use client";

import { useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";
import ConfirmDialog from "./ConfirmDialog";
import {
  clearAll,
  exportStoreJson,
  importStoreJson,
} from "@/lib/health-storage";
import {
  downloadJson,
  fileDateStamp,
  readFileAsText,
} from "@/lib/health-export";
import type { Bilingual } from "@/types/health";

type Pending = null | "restore" | "clearSection" | "clearAll";

/**
 * Local-data controls: CSV export (tool-specific), full JSON backup, restore
 * from backup, clear-this-tool, and delete-all. Every destructive action is
 * confirmed. Status is announced via an aria-live region. All actions are
 * local to the device — nothing is uploaded.
 */
export default function LocalDataControls({
  sectionLabel,
  onExportCsv,
  onExportJson,
  onClearSection,
}: {
  /** Name of this tool's data, e.g. "قراءات ضغط الدم". Omit on the hub. */
  sectionLabel?: Bilingual;
  onExportCsv?: () => void;
  onExportJson?: () => void;
  onClearSection?: () => void;
}) {
  const { t } = useLang();
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingRestore = useRef<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err"; msg: string } | null>(
    null,
  );

  const say = (kind: "ok" | "err", msg: string) => setStatus({ kind, msg });

  const handleBackup = () => {
    downloadJson(`our-clinic-health-backup-${fileDateStamp()}.json`, exportStoreJson());
    say("ok", t("تم تنزيل نسخة احتياطية.", "Backup downloaded."));
  };

  const onFileChosen = async (file: File | undefined) => {
    if (!file) return;
    try {
      pendingRestore.current = await readFileAsText(file);
      setPending("restore");
    } catch {
      say("err", t("تعذّر قراءة الملف.", "Could not read the file."));
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyRestore = () => {
    const text = pendingRestore.current;
    setPending(null);
    if (!text) return;
    const result = importStoreJson(text);
    if (result.ok) say("ok", t("تمت استعادة بياناتك.", "Your data was restored."));
    else say("err", t("الملف غير صالح.", "The file is not valid."));
    pendingRestore.current = null;
  };

  return (
    <section className="card-clinical rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-h3 font-bold text-navy-900">
        <Icon name="shield" className="h-5 w-5 text-brand-500" />
        {t("بياناتك على هذا الجهاز", "Your data on this device")}
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-navy-500">
        {t(
          "كل شيء محفوظ محليًا. يمكنك تصديره أو استعادته أو حذفه في أي وقت.",
          "Everything is stored locally. You can export, restore, or delete it anytime.",
        )}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {onExportCsv && (
          <button type="button" onClick={onExportCsv} className="btn-ghost text-sm">
            <Icon name="download" className="h-4 w-4" />
            {t("تصدير CSV", "Export CSV")}
          </button>
        )}
        {onExportJson && (
          <button type="button" onClick={onExportJson} className="btn-ghost text-sm">
            <Icon name="download" className="h-4 w-4" />
            {t("تصدير JSON", "Export JSON")}
          </button>
        )}
        <button type="button" onClick={handleBackup} className="btn-ghost text-sm">
          <Icon name="download" className="h-4 w-4" />
          {t("نسخة احتياطية (JSON)", "Backup (JSON)")}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="btn-ghost text-sm"
        >
          <Icon name="upload" className="h-4 w-4" />
          {t("استعادة نسخة", "Restore backup")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => onFileChosen(e.target.files?.[0])}
          aria-label={t("اختر ملف النسخة الاحتياطية", "Choose a backup file")}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-navy-100 pt-3">
        {onClearSection && sectionLabel && (
          <button
            type="button"
            onClick={() => setPending("clearSection")}
            className="btn px-4 py-2 text-sm text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"
          >
            <Icon name="trash" className="h-4 w-4" />
            {t("حذف بيانات هذه الأداة", "Clear this tool's data")}
          </button>
        )}
        <button
          type="button"
          onClick={() => setPending("clearAll")}
          className="btn px-4 py-2 text-sm text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"
        >
          <Icon name="trash" className="h-4 w-4" />
          {t("حذف كل البيانات", "Delete all data")}
        </button>
      </div>

      <p aria-live="polite" className="min-h-5">
        {status && (
          <span
            className={`mt-3 inline-block text-sm font-semibold ${
              status.kind === "ok" ? "text-mint-500" : "text-rose-600"
            }`}
          >
            {status.msg}
          </span>
        )}
      </p>

      <ConfirmDialog
        open={pending === "restore"}
        tone="brand"
        title={t("استعادة نسخة احتياطية؟", "Restore backup?")}
        body={t(
          "ستحل بيانات الملف محل بياناتك الحالية على هذا الجهاز.",
          "The file's data will replace your current data on this device.",
        )}
        confirmLabel={t("استعادة", "Restore")}
        cancelLabel={t("إلغاء", "Cancel")}
        onConfirm={applyRestore}
        onCancel={() => {
          setPending(null);
          pendingRestore.current = null;
        }}
      />

      <ConfirmDialog
        open={pending === "clearSection"}
        title={t("حذف بيانات هذه الأداة؟", "Clear this tool's data?")}
        body={t(
          `سيتم حذف ${sectionLabel ? sectionLabel.ar : ""} نهائيًا من هذا الجهاز.`,
          `This will permanently remove ${sectionLabel ? sectionLabel.en : "this tool's data"} from this device.`,
        )}
        confirmLabel={t("حذف", "Delete")}
        cancelLabel={t("إلغاء", "Cancel")}
        onConfirm={() => {
          setPending(null);
          onClearSection?.();
          say("ok", t("تم حذف بيانات هذه الأداة.", "This tool's data was deleted."));
        }}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending === "clearAll"}
        title={t("حذف كل بيانات رفيق صحتك؟", "Delete all Health Companion data?")}
        body={t(
          "سيتم حذف جميع القياسات والأدوية والملاحظات نهائيًا من هذا الجهاز. لا يمكن التراجع.",
          "All measurements, medications, and notes will be permanently removed from this device. This cannot be undone.",
        )}
        confirmLabel={t("حذف الكل", "Delete all")}
        cancelLabel={t("إلغاء", "Cancel")}
        onConfirm={() => {
          setPending(null);
          clearAll();
          say("ok", t("تم حذف كل البيانات.", "All data was deleted."));
        }}
        onCancel={() => setPending(null)}
      />
    </section>
  );
}
