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
  title: "Jason Teixeira | QA Automation Engineer",
  description: "QA Automation Engineer with 8+ years experience building bulletproof test frameworks. ISTQB certified, specializing in Selenium, Python, API testing, and CI/CD integration.",
  keywords: ["QA Automation", "Test Automation", "Selenium", "Python", "API Testing", "ISTQB", "CI/CD", "DevOps"],
  authors: [{ name: "Jason Teixeira" }],
  openGraph: {
    title: "Jason Teixeira | QA Automation Engineer",
    description: "Building bulletproof test frameworks that ship quality software faster",
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
