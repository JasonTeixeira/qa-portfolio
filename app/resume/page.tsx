import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Resume | Jason Teixeira - QA Automation Engineer",
  description: "Resume and professional experience for Jason Teixeira (QA Automation Engineer).",
};

export default function ResumePage() {
  // Keep the canonical resume as a static file for easy printing/downloading.
  // This route exists to support /resume URLs (and link-checkers) cleanly.
  redirect("/resume.html");
}

