"use client";

import React from "react";
import { useLang } from "@/lib/i18n";
import Icon from "@/components/Icon";

/** One column of the generic measurement table. */
export interface HistoryColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  /** Hide this column on the mobile card view to reduce clutter. */
  primary?: boolean;
}

/**
 * Generic, accessible history renderer shared by the blood-pressure and
 * blood-glucose tools. Renders a real <table> with a caption on wider screens
 * and a stacked card list on mobile (the wide-table alternative). Edit/Delete
 * are icon buttons with explicit labels; deletion is confirmed by the parent.
 */
export default function MeasurementHistory<T extends { id: string }>({
  caption,
  rows,
  columns,
  onEdit,
  onDelete,
  emptyState,
}: {
  caption: string;
  rows: T[];
  columns: HistoryColumn<T>[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  emptyState: React.ReactNode;
}) {
  const { t } = useLang();

  if (rows.length === 0) return <>{emptyState}</>;

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-xs sm:block">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-navy-100 bg-cloud text-start">
              {columns.map((c, i) => (
                <th
                  key={i}
                  scope="col"
                  className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-navy-500"
                >
                  {c.header}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-end text-xs font-bold uppercase tracking-wide text-navy-500">
                {t("إجراءات", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-navy-50 last:border-0 hover:bg-cloud/60">
                {columns.map((c, i) => (
                  <td key={i} className="px-4 py-3 align-top text-navy-800">
                    {c.cell(row)}
                  </td>
                ))}
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center justify-end gap-1">
                    <RowAction icon="pencil" label={t("تعديل", "Edit")} onClick={() => onEdit(row)} />
                    <RowAction icon="trash" label={t("حذف", "Delete")} danger onClick={() => onDelete(row)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <ul className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <li key={row.id} className="rounded-2xl border border-navy-100 bg-white p-4 shadow-xs">
            <dl className="space-y-1.5">
              {columns.map((c, i) => (
                <div key={i} className="flex justify-between gap-3 text-sm">
                  <dt className="font-semibold text-navy-500">{c.header}</dt>
                  <dd className="text-end text-navy-800">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex justify-end gap-2 border-t border-navy-50 pt-3">
              <button type="button" onClick={() => onEdit(row)} className="btn-ghost px-3 py-1.5 text-xs">
                <Icon name="pencil" className="h-3.5 w-3.5" /> {t("تعديل", "Edit")}
              </button>
              <button
                type="button"
                onClick={() => onDelete(row)}
                className="btn px-3 py-1.5 text-xs text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"
              >
                <Icon name="trash" className="h-3.5 w-3.5" /> {t("حذف", "Delete")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function RowAction({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 items-center justify-center rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        danger
          ? "text-rose-500 hover:bg-rose-50"
          : "text-navy-500 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}
