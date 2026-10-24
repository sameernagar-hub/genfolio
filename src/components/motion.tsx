"use client";

// Motion primitives that turn copy into something you watch instead of read.
// Every one of them degrades to plain, static text under prefers-reduced-motion.

import {
  animate, AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Thin bar across the top showing read progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: x }}
      className="fixed inset-x-0 top-0 z-[55] h-0.5 origin-left bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
    />
  );
}

/** Words light up one by one as the paragraph scrolls through the viewport. `*word*` marks an accent. */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={`flex flex-wrap gap-x-[0.28em] ${className}`}>
      {words.map((raw, i) => {
        const accent = /^\*.*\*[.,:]?$/.test(raw);
        const word = raw.replace(/\*/g, "");
        const start = i / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, start + 1 / words.length]} accent={accent} still={!!reduce}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

function Word({ children, progress, range, accent, still }: { children: string; progress: MotionValue<number>; range: [number, number]; accent: boolean; still: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={still ? undefined : { opacity }} className={accent ? "text-gradient" : undefined}>
      {children}
    </motion.span>
  );
}

/** Animated number: counts from 0 to the numeric part of `value` ("99.9%", "15+", "5×"). */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const match = value.match(/^([^\d]*)([\d.]+)(.*)$/);
  const [shown, setShown] = useState(match && !reduce ? `${match[1]}0${match[3]}` : value);

  useEffect(() => {
    if (!inView || !match || reduce) return;
    const target = parseFloat(match[2]);
    const decimals = match[2].includes(".") ? match[2].split(".")[1].length : 0;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(`${match[1]}${v.toFixed(decimals)}${match[3]}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {shown}
    </span>
  );
}

/** Cycles through words in place with a vertical slide. */
export function Rotator({ words, interval = 2400, className = "" }: { words: string[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduce]);
  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      {/* invisible longest word reserves width so the line never jumps */}
      <span className="invisible col-start-1 row-start-1">{words.reduce((a, b) => (b.length > a.length ? b : a))}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-gradient col-start-1 row-start-1"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Heading whose words rise in, staggered, when scrolled into view. */
export function SplitText({ text, as: Tag = "h2", className = "" }: { text: string; as?: "h1" | "h2" | "h3" | "p"; className?: string }) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag];
  if (reduce) return <Tag className={className}>{text}</Tag>;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ staggerChildren: 0.06 }}
      aria-label={text}
    >
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "110%" }, show: { y: "0%", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
          >
            {w}
            {" "}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

/** 3D tilt that follows the pointer. */
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Bar that grows to `pct` when it scrolls into view. */
export function GrowBar({ pct, className = "" }: { pct: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`h-full rounded-full ${className}`}
      initial={reduce ? false : { width: 0 }}
      whileInView={{ width: `${pct}%` }}
      viewport={{ once: true }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      style={reduce ? { width: `${pct}%` } : undefined}
    />
  );
}
