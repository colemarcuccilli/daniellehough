import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://hcirwveiubnxglzitats.supabase.co").hostname;
  } catch {
    return "hcirwveiubnxglzitats.supabase.co";
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/portfolio-web/**",
      },
    ],
    qualities: [70, 75, 85],
    // Derivative paths never change once written, so let the optimizer cache long.
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
