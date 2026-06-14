"use client";

import { Truck, Zap, Gift } from "lucide-react";

const messages = [
  { icon: Truck, text: "Free shipping on orders over $100" },
  { icon: Zap, text: "Flash sale — up to 40% off select items" },
  { icon: Gift, text: "New arrivals every week — stay tuned" },
];

export function AnnouncementBar() {
  return (
    <div className="relative overflow-hidden bg-zinc-900 text-white dark:bg-zinc-800">
      <div className="marquee-track py-2">
        {/* Duplicate messages for seamless loop */}
        {[...messages, ...messages, ...messages].map((msg, i) => (
          <span
            key={i}
            className="mx-8 inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium tracking-wide"
          >
            <msg.icon className="h-3.5 w-3.5 text-amber-400" />
            {msg.text}
            <span className="mx-4 text-zinc-600">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
