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
  threshold = 0.01,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [useDelay, setUseDelay] = useState(true);

  useEffect(() => {
    // Delays should only apply to above-the-fold content that loads initially.
    // We disable delayed animation start for below-the-fold elements that are scrolled to later.
    const timer = setTimeout(() => {
      setUseDelay(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Detect if user has requested reduced motion to disable all animations
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { 
        threshold, 
        // Use an eager rootMargin to trigger the animation 100px before entering the viewport.
        // On mobile viewports, this prevents late/delayed pop-in visuals.
        rootMargin: "0px 0px 100px 0px" 
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const animationDelay = useDelay && delay ? `${delay}s` : undefined;

  return (
    <Tag
      ref={ref}
      className={`${visible ? variantClass[variant] : "opacity-0"} ${className}`}
      style={{ 
        animationDelay,
        willChange: visible ? undefined : "transform, opacity"
      }}
    >
      {children}
    </Tag>
  );
}

