import type { Metadata } from "next";
import ContactHero from "@/components/sections/contact/ContactHero";
import ContactForm from "@/components/sections/contact/ContactForm";
import ContactInfo from "@/components/sections/contact/ContactInfo";

export const metadata: Metadata = {
  title: "Contact | Jason Teixeira - QA Automation Engineer",
  description: "Get in touch about QA automation opportunities, consulting, or technical questions. Open to remote positions.",
};

export default function ContactPage() {
  return (
    <div>
      <ContactHero />
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-lighter">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <ContactForm />
          <ContactInfo />
        </div>
      </div>
    </div>
  );
}
