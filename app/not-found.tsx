"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Looks like this test failed. The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-dark font-semibold rounded hover:bg-primary-dark transition-all duration-200"
          >
            <Home size={20} />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold rounded hover:bg-primary hover:text-dark transition-all duration-200"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-dark-lighter">
          <p className="text-gray-400 mb-4">Here are some helpful links instead:</p>
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <Link href="/about" className="text-primary hover:text-primary-dark transition-colors">
              About Me
            </Link>
            <Link href="/projects" className="text-primary hover:text-primary-dark transition-colors">
              Projects
            </Link>
            <Link href="/blog" className="text-primary hover:text-primary-dark transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-primary hover:text-primary-dark transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
