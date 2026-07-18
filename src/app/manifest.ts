import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "OurClinic | عيادتنا",
    short_name: "OurClinic",
    description:
      "عيادتنا — نموذج ثنائي اللغة لخدمات العيادة وحجز المواعيد والمحتوى الصحي العام. OurClinic — a bilingual demo for clinic services, appointment booking, and general health content.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    background_color: "#f6f9fe",
    theme_color: "#1c61d4",
    orientation: "any",
    lang: "ar",
    dir: "rtl",
    categories: ["medical", "health", "lifestyle"],
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "حجز موعد | Booking", short_name: "Booking", url: "/booking", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
      { name: "رفيق صحتك | Health Companion", short_name: "Companion", url: "/health-journey", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
      { name: "الخدمات | Services", short_name: "Services", url: "/services", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
      { name: "نصائح طبية | Medical Tips", short_name: "Tips", url: "/medical-tips", icons: [{ src: "/pwa/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
