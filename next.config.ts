import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/analyze": [
      "./samples/invoice-pilot/README.md",
      "./samples/invoice-pilot/next.config.ts",
      "./samples/invoice-pilot/package.json",
      "./samples/invoice-pilot/vercel.json",
      "./samples/invoice-pilot/src/app/api/**/*.ts",
      "./samples/invoice-pilot/src/app/invoice/**/*.tsx",
      "./samples/invoice-pilot/src/app/layout.tsx",
      "./samples/invoice-pilot/src/app/login/page.tsx",
      "./samples/invoice-pilot/src/app/page.tsx",
      "./samples/invoice-pilot/src/components/**/*.tsx",
      "./samples/invoice-pilot/src/lib/**/*.ts",
      "./samples/invoice-pilot/supabase/migrations/*.sql",
    ],
  },
};

export default nextConfig;
