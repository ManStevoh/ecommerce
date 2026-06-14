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
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/30 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-8 py-14 text-white shadow-2xl dark:border-zinc-700/30 md:px-16">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl animate-float-2" />

        <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md text-center md:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wider uppercase">
              <Mail className="h-3.5 w-3.5" />
              Newsletter
            </div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Stay in the loop
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
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
                className="h-12 rounded-xl border-zinc-700 bg-zinc-800/80 pl-4 pr-4 text-white placeholder:text-zinc-500 focus-visible:ring-amber-500/50"
              />
            </div>
            <Button
              type="submit"
              variant="luxury"
              className="h-12 shrink-0 rounded-xl px-6"
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
