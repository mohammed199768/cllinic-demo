"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import KidsGameShell, { GlassCard } from "@/components/kids/KidsGameShell";
import KidsObject from "@/components/kids/KidsObject";
import Icon from "@/components/Icon";
import { KIDS_GAMES, FEATURED_GAME, type KidsGame } from "@/data/kidsGames";

export default function KidsView() {
  const { t, lang } = useLang();
  const L = (b: { ar: string; en: string }) => (lang === "ar" ? b.ar : b.en);
  const others = KIDS_GAMES.filter((g) => !g.featured);

  return (
    <KidsGameShell back={false}>
      <section className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-4 py-1.5 text-sm font-semibold text-brand-700 backdrop-blur">
          <Icon name="shield" className="h-[18px] w-[18px]" />{" "}
          {t("عالم الألعاب الآمن", "A safe games world")}
        </span>
        <h1 className="mt-5 text-display font-extrabold text-navy-900">
          {t("صغيرنا الذكي", "Smart Little One")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lead text-navy-500">
          {t(
            "عالم من الألعاب والحكايات يساعد طفلك يتعلم، يركز، ويلعب بطريقة آمنة ومرحة.",
            "A playful world of games and stories that helps your child learn, focus, and play safely.",
          )}
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-3xl">
        <Link
          href={FEATURED_GAME.href}
          className="group block overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-brand-50 via-cyan-50 to-[#efeaff] p-7 shadow-card transition hover:-translate-y-1 hover:shadow-float focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:p-9"
        >
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-start rtl:sm:flex-row-reverse">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white bg-white/80 shadow-soft">
              <KidsObject id={FEATURED_GAME.object} size={60} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-wider text-brand-600">
                {t("اللعبة المميزة", "Featured game")}
              </p>
              <h2 className="mt-1 text-h2 font-extrabold text-navy-900">
                {L(FEATURED_GAME.title)}
              </h2>
              <p className="mt-2 text-navy-500">{L(FEATURED_GAME.desc)}</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-soft">
                <Icon name="play" className="h-4 w-4" />{" "}
                {t("ابدأ اللعب", "Start Playing")}
              </span>
            </div>
          </div>
        </Link>
      </section>

      <section className="mx-auto mt-14 max-w-5xl">
        <h2 className="mb-6 text-center text-h2 font-extrabold text-navy-900">
          {t("مجرّة الألعاب", "Game Galaxy")}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((g) => (
            <GameCard key={g.id} game={g} L={L} t={t} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-2xl">
        <GlassCard className="text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-50 ring-1 ring-mint-100">
            <Icon name="shield" className="h-6 w-6 text-mint-500" />
          </div>
          <h2 className="text-h3 font-extrabold text-navy-900">
            {t("راحة بال للوالدين", "Peace of mind for parents")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-navy-500">
            {t(
              "لا يحتاج تسجيل دخول، ولا يتم حفظ بيانات الطفل داخل الموقع. يتم إدخال اسم الطفل فقط عند إنشاء بطاقة الفوز.",
              "No login is required, and the child's data is not stored on the website. The child's name is entered only when creating the reward card.",
            )}
          </p>
        </GlassCard>
      </section>

      <section className="mx-auto mt-12 max-w-2xl">
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-h3 font-extrabold text-navy-900">
              {t(
                "بطاقة تشجيعية لكل بطل",
                "An encouragement card for every champion",
              )}
            </h2>
            <p className="mt-3 text-navy-500">
              {t(
                "بعد كل لعبة يمكن لصغيرنا الذكي إنشاء بطاقة تشجيعية تحمل اسمه ورمز QR من عيادتنا.",
                "After each game, your smart little one can create an encouragement card with their name and a QR code from OurClinic.",
              )}
            </p>
            <Link
              href="/bedtime-stories"
              className="btn-ghost mt-5 inline-flex"
            >
              <KidsObject id="moon" size={18} />{" "}
              {t("حكايات المساء", "Evening Stories")}
            </Link>
          </div>
          <div className="rounded-[1.75rem] border-4 border-white bg-gradient-to-br from-brand-50 to-mint-50 p-6 text-center shadow-float">
            <div className="text-4xl" aria-hidden>
              🌟
            </div>
            <p className="mt-1 text-sm font-bold text-brand-600">
              {t("بطاقة تشجيعية", "Encouragement Card")}
            </p>
            <p className="mt-2 text-lg font-extrabold text-navy-900">
              {t("اسم الطفل", "Child's name")}
            </p>
            <p className="text-sm font-semibold text-mint-500">
              {t("اسم اللعبة", "Game name")}
            </p>
            <div
              className="mx-auto mt-3 grid h-16 w-16 grid-cols-3 grid-rows-3 gap-0.5 rounded-lg bg-white p-1.5 shadow-soft"
              aria-hidden
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <span
                  key={i}
                  className={`rounded-[2px] ${[0, 2, 4, 5, 6, 8].includes(i) ? "bg-navy-900" : "bg-transparent"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-bold text-brand-700">
              {t("عيادتنا", "OurClinic")}
            </p>
          </div>
        </div>
      </section>
    </KidsGameShell>
  );
}

function GameCard({
  game,
  L,
  t,
}: {
  game: KidsGame;
  L: (b: { ar: string; en: string }) => string;
  t: (ar: string, en: string) => string;
}) {
  return (
    <Link
      href={game.href}
      className="group flex h-full flex-col rounded-[1.75rem] border border-white bg-white/80 p-5 shadow-card backdrop-blur-xl transition hover:-translate-y-1.5 hover:shadow-float focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-navy-100 bg-brand-50/60 transition group-hover:scale-105">
          <KidsObject id={game.object} size={40} />
        </div>
        <span className="rounded-full bg-mint-50 px-2.5 py-1 text-xs font-bold text-mint-600 ring-1 ring-mint-100">
          {t("متاح", "Available")}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-navy-900">
        {L(game.title)}
      </h3>
      <p className="mt-1 text-sm text-navy-500">{L(game.desc)}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
          {L(game.age)}
        </span>
        {game.skills.map((s, i) => (
          <span
            key={i}
            className="rounded-full border border-navy-100 bg-white px-2.5 py-0.5 text-xs font-semibold text-navy-500"
          >
            {L(s)}
          </span>
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600">
        {t("ابدأ اللعب", "Start Playing")}
        <Icon
          name="arrow"
          className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
        />
      </span>
    </Link>
  );
}
