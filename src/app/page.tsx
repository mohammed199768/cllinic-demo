"use client";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/home/SplashScreen";
import HeroEditorial from "@/components/home/HeroEditorial";
import CareMosaic from "@/components/home/CareMosaic";
import HealthCompanionFeature from "@/components/home/HealthCompanionFeature";
import HomeClinicTour from "@/components/home/HomeClinicTour";
import AppointmentBooking from "@/components/home/AppointmentBooking";
import HomeSectionPager from "@/components/home/HomeSectionPager";
import SiteFooter from "@/components/SiteFooter";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [pagerOn, setPagerOn] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      setPagerOn(desktop && !reduce);
    };
    evaluate();
    window.addEventListener("resize", evaluate);
    return () => window.removeEventListener("resize", evaluate);
  }, []);

  const panels = [
    <HeroEditorial key="hero" />,
    <CareMosaic key="mosaic" />,
    <HealthCompanionFeature key="health-companion" />,
    <HomeClinicTour key="tour" />,
    <AppointmentBooking key="visit" />,
    <SiteFooter key="footer" force />,
  ];

  return (
    <div className="w-full max-w-full overflow-x-clip bg-[#f6f9fe]">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {pagerOn ? (
        <HomeSectionPager panels={panels} />
      ) : (
        <div className="w-full max-w-full overflow-x-clip">
          {panels.map((p, i) => (
            <div key={i}>{p}</div>
          ))}
        </div>
      )}
    </div>
  );
}
