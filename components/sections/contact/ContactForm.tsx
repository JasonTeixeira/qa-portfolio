"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    subject: "",
    message: "",
    // Honeypot (bots fill this, humans won't)
    honey: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDirectContact, setShowDirectContact] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    // Simple validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    // Send to API route
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
      const url = base ? `${base}/contact` : '/api/contact';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Try to surface a helpful server error message
        let msg = 'Failed to send message';
        try {
          const data = await response.json();
          if (data?.error) msg = data.error;
        } catch {
          // ignore
        }
        if (/not configured/i.test(msg)) {
          setShowDirectContact(true);
        }
        throw new Error(msg);
      }
      
      setStatus("success");
      setFormData({ name: "", email: "", company: "", website: "", subject: "", message: "", honey: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again or email me directly at sage@sageideas.org");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold text-foreground mb-6">Send a Message</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot (visually hidden) */}
        <input
          type="text"
          name="honey"
          value={formData.honey}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-10000px] top-auto w-1 h-1 overflow-hidden"
          aria-hidden="true"
        />

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-dark-card border border-dark-lighter rounded text-foreground placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-dark-card border border-dark-lighter rounded text-foreground placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-semibold text-gray-300 mb-2">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-card border border-dark-lighter rounded text-foreground placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-semibold text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-card border border-dark-lighter rounded text-foreground placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-card border border-dark-lighter rounded text-foreground placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 bg-dark-card border border-dark-lighter rounded text-foreground placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full px-6 py-4 bg-primary text-dark font-semibold rounded hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <>
              <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>Send Message</span>
            </>
          )}
        </button>

        {/* Success Message */}
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded flex items-start gap-3"
          >
            <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-green-500 font-semibold">Message sent successfully!</p>
              <p className="text-gray-300 text-sm mt-1">
                I&apos;ll get back to you within 24-48 hours.
              </p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-500 font-semibold">Error sending message</p>
              <p className="text-gray-300 text-sm mt-1">{errorMessage}</p>

              {showDirectContact && (
                <div className="mt-3 text-sm text-gray-200">
                  <div className="font-semibold text-foreground">Quick workaround:</div>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>
                      Email me directly at{' '}
                      <a
                        className="text-primary underline underline-offset-4"
                        href="mailto:sage@sageideas.org"
                      >
                        sage@sageideas.org
                      </a>
                    </li>
                    <li>
                      Or set <span className="font-mono">WEB3FORMS_ACCESS_KEY</span> on Vercel to enable the form.
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
