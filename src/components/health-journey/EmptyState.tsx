"use client";

import Icon from "@/components/Icon";

export default function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-navy-200 bg-cloud/60 px-6 py-10 text-center">
      <span className="icon-pad mx-auto h-12 w-12"><Icon name={icon} className="h-6 w-6" /></span>
      <h3 className="mt-4 font-bold text-navy-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-navy-500">{body}</p>
    </div>
  );
}
