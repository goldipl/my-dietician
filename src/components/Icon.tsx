import type { SVGProps } from "react";

type Shape = { d: string } | { cx: number; cy: number; r: number } | { x: number; y: number; w: number; h: number; rx: number };

const ICONS = {
  leaf: [
    { d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" },
    { d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" },
  ],
  menu: [{ d: "M4 6h16M4 12h16M4 18h16" }],
  x: [{ d: "M18 6 6 18M6 6l12 12" }],
  sun: [
    { cx: 12, cy: 12, r: 4 },
    { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" },
  ],
  moon: [{ d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }],
  arrowRight: [{ d: "M5 12h14M12 5l7 7-7 7" }],
  chevronLeft: [{ d: "m15 18-6-6 6-6" }],
  check: [{ d: "M20 6 9 17l-5-5" }],
  flame: [
    {
      d: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z",
    },
  ],
  droplet: [{ d: "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" }],
  clock: [{ cx: 12, cy: 12, r: 10 }, { d: "M12 6v6l4 2" }],
  refresh: [
    { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5" },
    { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5" },
  ],
  alert: [{ d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3ZM12 9v4M12 17h.01" }],
  info: [{ cx: 12, cy: 12, r: 10 }, { d: "M12 16v-4M12 8h.01" }],
  trash: [{ d: "M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }],
  cart: [
    { cx: 8, cy: 21, r: 1 },
    { cx: 19, cy: 21, r: 1 },
    { d: "M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" },
  ],
  printer: [{ d: "M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" }],
  target: [
    { cx: 12, cy: 12, r: 10 },
    { cx: 12, cy: 12, r: 6 },
    { cx: 12, cy: 12, r: 2 },
  ],
  calendar: [{ x: 3, y: 4, w: 18, h: 18, rx: 2 }, { d: "M16 2v4M8 2v4M3 10h18" }],
  activity: [{ d: "M22 12h-4l-3 9L9 3l-3 9H2" }],
  utensils: [{ d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" }],
  book: [{ d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" }],
  dumbbell: [
    {
      d: "M14.4 14.4 9.6 9.6M18.66 21.49a2 2 0 1 1-2.83-2.83l-1.77 1.77a2 2 0 1 1-2.83-2.83l6.36-6.36a2 2 0 1 1 2.83 2.83l-1.77 1.77a2 2 0 1 1 2.83 2.83zM21.5 21.5l-1.4-1.4M3.9 3.9 2.5 2.5M6.4 12.77a2 2 0 1 1-2.83-2.83l1.77-1.77a2 2 0 1 1-2.83-2.83l2.83-2.83a2 2 0 1 1 2.83 2.83l1.77-1.77a2 2 0 1 1 2.83 2.83z",
    },
  ],
  trending: [{ d: "M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6" }],
  dashboard: [{ d: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" }],
  calculator: [
    { x: 4, y: 2, w: 16, h: 20, rx: 2 },
    { d: "M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" },
  ],
  plus: [{ d: "M12 5v14M5 12h14" }],
  search: [{ cx: 11, cy: 11, r: 8 }, { d: "m21 21-4.3-4.3" }],
  swap: [{ d: "m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16" }],
  user: [{ cx: 12, cy: 8, r: 5 }, { d: "M20 21a8 8 0 0 0-16 0" }],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {(ICONS[name] as Shape[]).map((s, i) =>
        "d" in s ? (
          <path key={i} d={s.d} />
        ) : "r" in s ? (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} />
        ) : (
          <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} />
        ),
      )}
    </svg>
  );
}
