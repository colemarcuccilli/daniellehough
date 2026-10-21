import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
const jost = Jost({ variable: "--font-jost", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://danicams.com";

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
  themeColor: "#3d4a3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-paper)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-sage)",
              borderRadius: "2px",
              boxShadow: "0 12px 32px -18px rgba(35, 40, 35, 0.35)",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
