import type { JSX } from "@solidjs/web";

// Yosegi's icons: outlines on a 16px grid with a 1.5px stroke, in
// currentColor, so each follows the text colour around it. The components draw
// some of them, and they are exported for apps. Inbox, SearchOff and Warning
// are on a 24px grid, for the large circles in EmptyState and ErrorState.
// Each file in the design system's Icons group matches one of these.

export type IconProps = Omit<JSX.SvgSVGAttributes<SVGSVGElement>, "children">;

const stroke = {
  viewBox: "0 0 16 16",
  width: "16",
  height: "16",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "1.5",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "aria-hidden": "true",
} as const;

const large = { ...stroke, viewBox: "0 0 24 24", width: "24", height: "24" } as const;

export function TickIcon(props: IconProps) {
  return (
    <svg {...stroke} stroke-width="2" {...props}>
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

export function DashIcon(props: IconProps) {
  return (
    <svg {...stroke} stroke-width="2" {...props}>
      <path d="M4 8h8" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M8 4v8M4 8h8" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M4 8h8" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M10 3.5L5.5 8l4.5 4.5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M6 3.5L10.5 8 6 12.5" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M3.5 6L8 10.5 12.5 6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 9h6l.5-9" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M8 1.5l5 2v4c0 3.2-2.1 5.6-5 7-2.9-1.4-5-3.8-5-7v-4z" />
      <path d="M8 5.5v3M8 10.5h.01" />
    </svg>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M4 1.5h5l3 3v10H4z" />
      <path d="M9 1.5v3h3" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M7 9a3 3 0 004.2.2l2-2A3 3 0 009 3l-1 1M9 7a3 3 0 00-4.2-.2l-2 2A3 3 0 007 13l1-1" />
    </svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5.5 4h7M5.5 8h7M5.5 12h7M3 4h.01M3 8h.01M3 12h.01" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.5v3.5M8 5h.01" />
    </svg>
  );
}

export function ArchiveIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="2" y="3" width="12" height="3" rx="1" />
      <path d="M3 6v7h10V6M6.5 9h3" />
    </svg>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <svg {...large} {...props}>
      <path d="M3.5 13.5l2.5-8h12l2.5 8v5.5h-17z" />
      <path d="M3.5 13.5h5l1 2h5l1-2h5" />
    </svg>
  );
}

export function SearchOffIcon(props: IconProps) {
  return (
    <svg {...large} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5M9 9l4 4M13 9l-4 4" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg {...large} {...props}>
      <path d="M12 3.5l9 16h-18z" />
      <path d="M12 10v4.5M12 17h.01" />
    </svg>
  );
}
