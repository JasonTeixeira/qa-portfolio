import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sageideas.org"),
  title: "Jason Teixeira | Cloud Automation Portfolio",
  description:
    "Cloud Automation Engineer building CI/CD pipelines, telemetry dashboards, infrastructure-as-code, and QA automation systems with evidence-backed artifacts.",
  keywords: [
    "Cloud Automation",
    "Infrastructure",
    "Terraform",
    "AWS",
    "CI/CD",
    "Platform Engineering",
    "Observability",
    "QA Automation",
    "Test Automation",
  ],
  authors: [{ name: "Jason Teixeira" }],
  openGraph: {
    title: "Jason Teixeira | Cloud Automation Portfolio",
    description:
      "Cloud automation systems (CI/CD, IaC, telemetry) plus QA automation proof: dashboards, runbooks, and artifacts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Navigation />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
