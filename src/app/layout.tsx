import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import "./globals.css";
import AppExperience from "@/components/AppExperience";
import { SITE_URL, CLINIC } from "@/lib/clinic";
import { SITE_METADATA_IDENTITY } from "@/config/clinic";

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ar",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

const englishFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-en",
  fallback: ["Arial", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#1c61d4",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_METADATA_IDENTITY.applicationName,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "OurClinic",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  title: {
    default: SITE_METADATA_IDENTITY.title,
    template: `%s | ${CLINIC.name.ar}`,
  },
  description: SITE_METADATA_IDENTITY.description,
  keywords: [
    "عيادتنا",
    "نموذج عيادة تجريبي عمّان",
    "OurClinic",
    "Amman clinic",
    "clinic demo Amman",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: CLINIC.name.ar,
    title: `${CLINIC.name.ar} | ${CLINIC.name.en}`,
    description: CLINIC.tagline.ar,
  },
  twitter: {
    card: "summary_large_image",
    title: `${CLINIC.name.ar} | ${CLINIC.name.en}`,
    description: CLINIC.tagline.ar,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className={`${arabicFont.variable} ${englishFont.variable} antialiased`}>
        <AppExperience>{children}</AppExperience>
      </body>
    </html>
  );
}
