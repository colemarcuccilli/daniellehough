import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://daniellehough.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Dani Cams · Danielle Hough, Photographer",
    template: "%s · Dani Cams",
  },
  description:
    "Photography for businesses and families across Indiana. Quarterly and monthly business photography, headshot days, events, and sessions by Danielle Hough.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    siteName: "Dani Cams",
    title: "Dani Cams · Danielle Hough, Photographer",
    description: "Photography for businesses and families across Indiana.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Dani Cams photography" }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f8c858",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-paper)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-ink)",
              borderRadius: "6px",
              boxShadow: "3px 3px 0 0 var(--color-ink)",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
