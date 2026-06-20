import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["500", "700", "800"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700"],
});

const spline = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Badge Hunter — GitHub Achievement Tracker",
  description:
    "Discover, track, and unlock your GitHub achievement badges. Analyze any profile to see badge progress, roadmaps, and stats.",
  openGraph: {
    title: "Badge Hunter — GitHub Achievement Tracker",
    description:
      "Analyze any GitHub profile to discover badges, track progress, and plan your next achievement.",
    url: "https://badge-hunter.vercel.app",
    siteName: "Badge Hunter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Badge Hunter — GitHub Achievement Tracker",
    description:
      "Analyze any GitHub profile to discover badges, track progress, and plan your next achievement.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Badge Hunter",
  description:
    "GitHub Achievement Badge Tracker — analyze profiles, track progress, compare developers.",
  url: "https://badge-hunter.vercel.app",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable} ${spline.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="font-hanken antialiased bg-[#f7f9f6] text-[#16211a] min-h-screen flex flex-col transition-colors duration-200"
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

