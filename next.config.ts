import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://hcirwveiubnxglzitats.supabase.co").hostname;
  } catch {
    return "hcirwveiubnxglzitats.supabase.co";
  }
})();

const webBucket = process.env.NEXT_PUBLIC_SUPABASE_WEB_BUCKET || "portfolio-web";

const nextConfig: NextConfig = {
  // The inquiry form's bot check only runs on danicams.com, so public pages on
  // the vercel.app address go to the real one. The admin and API stay put.
  async redirects() {
    return [
      {
        source: "/:path((?!api|admin|_next).*)",
        has: [{ type: "host", value: "daniellehough.vercel.app" }],
        destination: "https://danicams.com/:path",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: `/storage/v1/object/public/${webBucket}/**`,
      },
      // Original standalone project, kept until it's deleted so any cached
      // image URLs still load.
      {
        protocol: "https",
        hostname: "hcirwveiubnxglzitats.supabase.co",
        pathname: "/storage/v1/object/public/portfolio-web/**",
      },
    ],
    qualities: [70, 75, 85],
    // Derivative paths never change once written, so let the optimizer cache long.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
