"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Variant = "fadeInUp" | "fadeIn" | "slideInLeft" | "slideInRight" | "scaleIn";

const variantClass: Record<Variant, string> = {
  fadeInUp: "animate-fade-in-up",
  fadeIn: "animate-fade-in",
  slideInLeft: "animate-slide-in-left",
  slideInRight: "animate-slide-in-right",
  scaleIn: "animate-scale-in",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: React.ElementType;
  threshold?: number;
};

export function ScrollAnimator({
  children,
  variant = "fadeInUp",
  delay = 0,
  className = "",
  as: Tag = "div",
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={`${visible ? variantClass[variant] : "opacity-0"} ${className}`}
      style={{ animationDelay: delay ? `${delay}s` : undefined }}
    >
      {children}
    </Tag>
  );
}
