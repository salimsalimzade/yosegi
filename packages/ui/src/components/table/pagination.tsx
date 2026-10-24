import type { JSX } from "@solidjs/web";
import { createContext, For, omit, Show, useContext } from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { callHandler } from "../../primitives/dom";
import { ChevronLeftIcon, ChevronRightIcon } from "../../primitives/icons";
import { useLabels } from "../locale-provider/locale-provider";
import styles from "./pagination.module.scss";

export type PaginationSlot = { type: "page"; page: number } | { type: "ellipsis" };

interface PaginationContextValue {
  page: () => number;
  count: () => number;
  go: (page: number) => void;
  slots: () => PaginationSlot[];
  showLabels: () => boolean;
  labels: () => PaginationLabels;
}

const PaginationContext = createContext<PaginationContextValue>();
const usePagination = () => useContext(PaginationContext);

const range = (from: number, to: number) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/**
 * Which numbers show: always the first and last page, the current one and
 * `siblings` either side of it, with a gap of more than one page as “…”. The
 * number of slots stays the same as the current page moves, so the bar never
 * jumps: 16 pages on page 8 is 1 … 7 8 9 … 16, and on page 1 it's 1 2 3 4 5 … 16.
 */
export function paginationSlots(count: number, page: number, siblings = 1): PaginationSlot[] {
  const boundary = 1;
  const start = range(1, Math.min(boundary, count));
  const end = range(Math.max(count - boundary + 1, boundary + 1), count);
  const siblingsStart = Math.max(Math.min(page - siblings, count - boundary - siblings * 2 - 1), boundary + 2);
  const siblingsEnd = Math.min(Math.max(page + siblings, boundary + siblings * 2 + 2), count - boundary - 1);

  const pages: (number | "ellipsis")[] = [
    ...start,
    ...(siblingsStart > boundary + 2 ? ["ellipsis" as const] : boundary + 1 < count - boundary ? [boundary + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundary - 1
      ? ["ellipsis" as const]
      : count - boundary > boundary
        ? [count - boundary]
        : []),
    ...end,
  ];
  return pages.map((slot) => (slot === "ellipsis" ? { type: "ellipsis" } : { type: "page", page: slot }));
}

/** Numbered pages with Previous and Next. */
export interface PaginationProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "onChange"> {
  /** How many pages. */
  count: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown either side of the current one. 1 by default. */
  siblingCount?: number;
  /** “Previous” and “Next” next to the arrows. True by default. */
  showLabels?: boolean;
  /** The text it writes itself, like “Previous” and each page's name. The list's name is its aria-label. */
  labels?: Partial<PaginationLabels>;
}

/** The text Pagination writes itself, for another language. */
export interface PaginationLabels {
  /** Next to the back arrow. “Previous” by default. */
  previous: string;
  /** Next to the forward arrow. “Next” by default. */
  next: string;
  /** The back button's name. “Previous page” by default. */
  previousPage: string;
  /** The forward button's name. “Next page” by default. */
  nextPage: string;
  /** A page button's name: “Page 3”. */
  page: (page: number) => string;
}

const defaultLabels: PaginationLabels = {
  previous: "Previous",
  next: "Next",
  previousPage: "Previous page",
  nextPage: "Next page",
  page: (page) => `Page ${page}`,
};

function PaginationRoot(props: PaginationProps) {
  const count = () => Math.max(1, props.count);
  const [page, setPage] = createControllableSignal({
    value: () => props.page,
    defaultValue: () => props.defaultPage ?? 1,
    onChange: (next) => props.onPageChange?.(next),
  });
  const current = () => Math.min(Math.max(1, page()), count());
  const rest = omit(
    props,
    "count",
    "page",
    "defaultPage",
    "onPageChange",
    "siblingCount",
    "showLabels",
    "labels",
    "class",
    "children",
  );

  const labels = useLabels("pagination", defaultLabels, () => props.labels);

  return (
    <PaginationContext
      value={{
        page: current,
        count,
        go: (next) => setPage(Math.min(Math.max(1, next), count())),
        slots: () => paginationSlots(count(), current(), props.siblingCount ?? 1),
        showLabels: () => props.showLabels !== false,
        labels,
      }}
    >
      <nav aria-label="Pages" {...rest} class={[styles.root, "yosegi-pagination", props.class]}>
        <ul class={[styles.list, "yosegi-pagination-list"]}>
          <Show
            when={props.children}
            fallback={
              <>
                <Previous />
                <Items />
                <Next />
              </>
            }
          >
            {props.children}
          </Show>
        </ul>
      </nav>
    </PaginationContext>
  );
}

function Previous(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const pagination = usePagination();
  const rest = omit(props, "class", "onClick", "children");
  return (
    <li>
      <button
        type="button"
        // Named even when only the arrow shows: without labels, or in a narrow table box.
        aria-label={pagination.labels().previousPage}
        {...rest}
        class={[styles.step, "yosegi-pagination-previous", props.class]}
        disabled={pagination.page() <= 1}
        onClick={(event) => {
          callHandler(props.onClick, event);
          if (!event.defaultPrevented) pagination.go(pagination.page() - 1);
        }}
      >
        <ChevronLeftIcon />
        <Show when={pagination.showLabels()}>
          <span class={[styles.label, "yosegi-pagination-label"]}>
            {props.children ?? pagination.labels().previous}
          </span>
        </Show>
      </button>
    </li>
  );
}

function Next(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const pagination = usePagination();
  const rest = omit(props, "class", "onClick", "children");
  return (
    <li>
      <button
        type="button"
        aria-label={pagination.labels().nextPage}
        {...rest}
        class={[styles.step, "yosegi-pagination-next", props.class]}
        disabled={pagination.page() >= pagination.count()}
        onClick={(event) => {
          callHandler(props.onClick, event);
          if (!event.defaultPrevented) pagination.go(pagination.page() + 1);
        }}
      >
        <Show when={pagination.showLabels()}>
          <span class={[styles.label, "yosegi-pagination-label"]}>{props.children ?? pagination.labels().next}</span>
        </Show>
        <ChevronRightIcon />
      </button>
    </li>
  );
}

/** Renders an Item or an Ellipsis for each slot, unless you pass a function. */
function Items(props: { children?: (slot: PaginationSlot) => JSX.Element }) {
  const pagination = usePagination();
  return (
    <For each={pagination.slots()}>
      {(slot) =>
        props.children ? props.children(slot) : slot.type === "page" ? <Item page={slot.page} /> : <Ellipsis />
      }
    </For>
  );
}

function Item(props: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { page: number }) {
  const pagination = usePagination();
  const rest = omit(props, "page", "class", "onClick", "children");
  return (
    <li>
      <button
        type="button"
        aria-label={pagination.labels().page(props.page)}
        {...rest}
        class={[styles.item, "yosegi-pagination-item", props.class]}
        aria-current={pagination.page() === props.page ? "page" : undefined}
        onClick={(event) => {
          callHandler(props.onClick, event);
          if (!event.defaultPrevented) pagination.go(props.page);
        }}
      >
        {props.children ?? props.page}
      </button>
    </li>
  );
}

function Ellipsis(props: JSX.HTMLAttributes<HTMLSpanElement>) {
  const rest = omit(props, "class", "children");
  return (
    <li>
      <span aria-hidden="true" {...rest} class={[styles.ellipsis, "yosegi-pagination-ellipsis", props.class]}>
        {props.children ?? "…"}
      </span>
    </li>
  );
}

export const Pagination = Object.assign(PaginationRoot, { Previous, Items, Item, Ellipsis, Next });
