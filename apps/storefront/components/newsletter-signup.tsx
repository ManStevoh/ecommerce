"use client";

import { useState } from "react";
import { Button, Input } from "@nexora/ui";
import { Mail, ArrowRight, Check } from "lucide-react";
import { ScrollAnimator } from "./scroll-animator";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setEmail("");
    }
  };

  return (
    <ScrollAnimator>
      <section className="relative overflow-hidden rounded-3xl border border-[var(--tenant-border)] bg-[var(--tenant-surface)] px-8 py-14 text-[var(--tenant-text)] shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl md:px-16">
        {/* Dynamic decorative blobs matching brand accent colors */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-3xl animate-float"
          style={{ backgroundColor: "var(--tenant-accent)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full opacity-[0.08] blur-3xl animate-float-2"
          style={{ backgroundColor: "var(--tenant-secondary, var(--tenant-accent))" }}
        />

        <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md text-center md:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--tenant-border)] bg-[var(--tenant-bg)]/40 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-[var(--tenant-accent)] backdrop-blur-sm">
              <Mail className="h-3.5 w-3.5" />
              Newsletter
            </div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Stay in the loop
            </h2>
            <p className="mt-2 text-sm text-[var(--tenant-muted)] leading-relaxed">
              Get early access to new arrivals, exclusive deals, and curated
              style tips delivered to your inbox.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-12 rounded-xl border-[var(--tenant-border)] bg-[var(--tenant-bg)]/60 pl-4 pr-4 text-[var(--tenant-text)] placeholder:text-zinc-400 focus-visible:ring-[var(--tenant-accent)]/30 focus-visible:border-[var(--tenant-accent)]"
              />
            </div>
            <Button
              type="submit"
              variant="luxury"
              className="h-12 shrink-0 rounded-xl px-6 font-semibold"
            >
              {submitted ? (
                <>
                  <Check className="h-4 w-4" />
                  Subscribed!
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </ScrollAnimator>
  );
}
