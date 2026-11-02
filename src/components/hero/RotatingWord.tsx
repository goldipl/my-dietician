"use client";

import { useEffect, useState } from "react";

/** Cycles through words in place; all words share one grid cell so the line width never jumps. */
export function RotatingWord({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-grid overflow-hidden pb-[0.08em] align-bottom">
      <span className="sr-only">{words[0]}</span>
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden="true"
          className="col-start-1 row-start-1 bg-linear-to-r from-brand-strong via-brand to-[#84cc16] bg-clip-text text-transparent transition-all duration-700 ease-out"
          style={{
            opacity: i === index ? 1 : 0,
            transform: `translateY(${i === index ? 0 : i === (index + words.length - 1) % words.length ? -60 : 60}%)`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
