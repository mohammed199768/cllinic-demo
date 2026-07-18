import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl">🩹</div>
      <h1 className="mt-4 text-2xl font-extrabold text-ink">الصفحة غير موجودة / Page not found</h1>
      <p className="mt-2 text-slate-600">عذراً، لم نجد ما تبحث عنه. / Sorry, we couldn&apos;t find that page.</p>
      <Link href="/" className="btn-primary mt-6">العودة للرئيسية / Back home</Link>
    </div>
  );
}
