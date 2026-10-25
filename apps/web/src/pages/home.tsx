import { createEffect, createMemo, createSignal, For, onCleanup, onSettled, Show } from "solid-js";
import {
  Button,
  Checkbox,
  CloseIcon,
  Command,
  type CommandAction,
  DatePicker,
  Item,
  Pagination,
  Select,
  Tabs,
  type TabsItem,
  TextField,
  Toaster,
  Tooltip,
  toast,
} from "yosegi";
import { SiteHeader } from "../components/site-header";
import { theme } from "../theme";
import styles from "./home.module.scss";

// Accents to try, each with a shade for either theme that keeps text at 4.5:1.
const accents = {
  matcha: { label: "Matcha", light: "#466a35", dark: "#9cc486" },
  indigo: { label: "Indigo", light: "#2f5ea8", dark: "#8fb3ff" },
  amber: { label: "Amber", light: "#85561a", dark: "#e0b36a" },
  plum: { label: "Plum", light: "#74407f", dark: "#d0a4dc" },
} as const;

type Accent = keyof typeof accents;
type Tab = "all" | "pinned" | "archive";
type Flash = "form" | "calendar" | "tabs";

const visibilities = [
  { value: "private", label: "Private" },
  { value: "team", label: "Shared with team" },
];

// Words the command search types by itself, one after another.
const demoSearches = ["export", "note", "archive", "share"];

const members = [
  { initials: "EC", name: "Emma Clarke", role: "Owner" },
  { initials: "JW", name: "James Walker", role: "Can edit" },
  { initials: "OB", name: "Olivia Bennett", role: "Can read" },
];

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

function inDays(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

const prefersReducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The front page: a short introduction, and live components that answer each other. */
export function Home() {
  const [accent, setAccent] = createSignal<Accent>("matcha");
  const [accentChanging, setAccentChanging] = createSignal(false);

  const [name, setName] = createSignal("Reading list");
  const [nameTouched, setNameTouched] = createSignal(false);
  const [visibility, setVisibility] = createSignal("private");
  const [weekly, setWeekly] = createSignal(true);
  const [creating, setCreating] = createSignal(false);
  const [project, setProject] = createSignal("");

  const [due, setDue] = createSignal<Date | null>(inDays(3));

  const [tab, setTab] = createSignal<Tab>("all");
  const [counts, setCounts] = createSignal<Record<Tab, number>>({ all: 12, pinned: 3, archive: 27 });
  // Which count went up last; the parity picks one of two identical animations, so each bump replays it.
  const [bump, setBump] = createSignal<{ tab: Tab; times: number }>();

  const [flash, setFlash] = createSignal<Flash>();
  const [shown, setShown] = createSignal(0);
  const [query, setQuery] = createSignal("");
  const [typing, setTyping] = createSignal(!prefersReducedMotion());

  // Timers for what people do, and for the search that types itself; leaving the page stops both.
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const typingTimers = new Set<ReturnType<typeof setTimeout>>();
  const schedule = (set: typeof timers) => (run: () => void, ms: number) => {
    const timer = setTimeout(() => {
      set.delete(timer);
      run();
    }, ms);
    set.add(timer);
    return timer;
  };
  const later = schedule(timers);
  const laterTyping = schedule(typingTimers);
  onCleanup(() => [...timers, ...typingTimers].forEach(clearTimeout));

  const projectName = () => name().trim() || "Untitled";
  const nameMissing = () => !name().trim();
  const accentColor = () => accents[accent()][theme()];

  const notify = (type: "default" | "success" | "error", title: string) => {
    setShown((n) => n + 1);
    if (type === "default") toast(title);
    else toast[type](title);
  };

  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  const flashCard = (card: Flash) => {
    setFlash(card);
    clearTimeout(flashTimer);
    flashTimer = later(() => setFlash(undefined), 1200);
  };

  const addTo = (key: Tab) => {
    setCounts((c) => ({ ...c, [key]: c[key] + 1 }));
    setBump((b) => ({ tab: key, times: (b?.times ?? 0) + 1 }));
    setTab(key);
    flashCard("tabs");
  };

  // The accent goes on the whole document, so floating lists and tooltips pick it up too.
  createEffect(accentColor, (color) => {
    const root = document.documentElement.style;
    for (const token of ["bg-accent", "fg-accent", "border-focus"]) root.setProperty(`--yosegi-color-${token}`, color);
    return () => {
      for (const token of ["bg-accent", "fg-accent", "border-focus"]) root.removeProperty(`--yosegi-color-${token}`);
    };
  });

  const pickAccent = (key: Accent) => {
    if (key === accent()) return;
    setAccentChanging(true);
    setAccent(key);
    later(() => setAccentChanging(false), 350);
    notify("success", `Accent changed to ${accents[key].label}`);
  };

  // ---------------------------------------------------------------- Form

  const create = (event: SubmitEvent) => {
    event.preventDefault();
    setNameTouched(true);
    if (nameMissing()) {
      notify("error", "Give the project a name first");
      return;
    }
    const created = projectName();
    const when = due();
    setCreating(true);
    later(() => {
      setCreating(false);
      setProject(created);
      notify("success", when ? `${created} created, due ${day.format(when)}` : `${created} created`);
    }, 1000);
  };

  const reset = () => {
    setName("Reading list");
    setNameTouched(false);
    setVisibility("private");
    setWeekly(true);
  };

  // ------------------------------------------------------------- Command

  const commands: { label: string; shortcut?: string; run: () => void }[] = [
    {
      label: "New note",
      shortcut: "⌘N",
      run: () => {
        addTo("all");
        notify("success", `Note added to ${projectName()}`);
      },
    },
    {
      label: "Pin a note",
      run: () => {
        addTo("pinned");
        notify("success", "Note pinned");
      },
    },
    {
      label: "Set a due date",
      run: () => {
        flashCard("calendar");
        notify("default", "Pick a day in the calendar");
      },
    },
    { label: "Share project", run: () => notify("success", `Link to ${projectName()} copied`) },
    {
      label: "Export as CSV",
      shortcut: "⌘E",
      run: () => {
        setShown((n) => n + 1);
        const id = toast.loading(`Exporting ${projectName()}…`);
        later(() => toast.success("Export ready", { id }), 1500);
      },
    },
    {
      label: "Archive a note",
      run: () => {
        addTo("archive");
        notify("success", "Note archived");
      },
    },
    {
      label: "Rename project",
      run: () => {
        flashCard("form");
        notify("default", "Type a new name in the form");
      },
    },
  ];

  const search = () => query().trim().toLowerCase();
  const matches = (label: string) => !search() || label.toLowerCase().includes(search());
  const heading = () => {
    if (!search()) return "Suggestions";
    const found = commands.filter((c) => matches(c.label)).length;
    return `${found} ${found === 1 ? "result" : "results"}`;
  };

  // The part of a label the search found, in the accent.
  const Highlighted = (props: { text: string }) => {
    const at = () => (search() ? props.text.toLowerCase().indexOf(search()) : -1);
    return (
      // One element, so the row's gap doesn't split the label around the match.
      <span>
        <Show when={at() >= 0} fallback={props.text}>
          {props.text.slice(0, at())}
          <span class={styles.hit}>{props.text.slice(at(), at() + search().length)}</span>
          {props.text.slice(at() + search().length)}
        </Show>
      </span>
    );
  };

  // Rebuilt only when the heading changes; the labels follow the search by themselves.
  const items = createMemo<CommandAction[]>(() =>
    commands.map((command) => ({
      value: command.label,
      label: <Highlighted text={command.label} />,
      shortcut: command.shortcut,
      group: heading(),
      onSelect: command.run,
    })),
  );

  let commandBox: HTMLDivElement | undefined;
  let caret: HTMLSpanElement | undefined;
  const commandInput = () => commandBox?.querySelector<HTMLInputElement>("input") ?? undefined;

  // The typing caret sits where the input's text starts, in the input's own font.
  const placeCaret = () => {
    const input = commandInput();
    if (!input || !commandBox || !caret) return;
    const box = commandBox.getBoundingClientRect();
    const field = input.getBoundingClientRect();
    const style = getComputedStyle(input);
    caret.style.left = `${field.left - box.left + Number.parseFloat(style.paddingLeft)}px`;
    caret.style.top = `${field.top - box.top}px`;
    caret.style.height = `${field.height}px`;
    caret.style.font = style.font;
  };

  onSettled(() => {
    placeCaret();
    const observer = new ResizeObserver(placeCaret);
    if (commandBox) observer.observe(commandBox);
    return () => observer.disconnect();
  });

  // Types into the search the way a person would, so it filters and highlights for real.
  const typeInto = (text: string) => {
    const input = commandInput();
    if (!input) return;
    input.value = text;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const stopTyping = () => {
    if (!typing()) return;
    setTyping(false);
    typingTimers.forEach(clearTimeout);
    typingTimers.clear();
  };

  onSettled(() => {
    if (!typing()) return;
    let word = 0;
    const type = () => {
      const text = demoSearches[word % demoSearches.length];
      let length = 0;
      const step = () => {
        if (length <= text.length) {
          typeInto(text.slice(0, length++));
          laterTyping(step, 110);
        } else laterTyping(erase, 2600);
      };
      step();
    };
    const erase = () => {
      const current = commandInput()?.value ?? "";
      if (current) {
        typeInto(current.slice(0, -1));
        laterTyping(erase, 45);
      } else {
        word++;
        laterTyping(type, 900);
      }
    };
    laterTyping(type, 1200);
  });

  // ---------------------------------------------------------------- Tabs

  const TabLabel = (props: { tab: Tab; label: string }) => (
    <>
      {props.label}
      <span
        class={[
          styles.count,
          bump()?.tab === props.tab && (bump()!.times % 2 ? styles["bump-odd"] : styles["bump-even"]),
        ]}
      >
        {counts()[props.tab]}
      </span>
    </>
  );

  const TabPanel = (props: { tab: Tab; text: string }) => (
    <p class={styles.muted}>
      {counts()[props.tab]} {props.text}
    </p>
  );

  const tabs: TabsItem[] = [
    {
      value: "all",
      label: <TabLabel tab="all" label="All" />,
      content: <TabPanel tab="all" text="notes, newest first." />,
    },
    {
      value: "pinned",
      label: <TabLabel tab="pinned" label="Pinned" />,
      content: <TabPanel tab="pinned" text="pinned notes stay at the top." />,
    },
    {
      value: "archive",
      label: <TabLabel tab="archive" label="Archive" />,
      content: <TabPanel tab="archive" text="archived notes. Nothing is deleted." />,
    },
  ];

  onSettled(() => {
    // Outside the render, where writing state is always allowed.
    queueMicrotask(() => notify("success", "Welcome. Every piece here works."));
  });

  return (
    <div class={styles.root} data-accent-changing={accentChanging() ? "" : undefined}>
      <SiteHeader />

      <main class={styles.main}>
        <section class={styles.intro}>
          <span class={styles.badge}>A design system for SolidJS</span>
          <h1 class={styles.title}>Small, plain pieces that fit together.</h1>
          <p class={styles.lead}>
            Calm, accessible components for SolidJS. One accent, thin lines, soft corners, and every value a CSS custom
            property you can change.
          </p>
          <div class={styles.actions}>
            <Button as="a" href="https://github.com/salimsalimzade/yosegi#readme" size="lg" label="Get started" />
            <Button as="a" href="/examples" size="lg" variant="outline" label="See examples" />
          </div>

          <div class={styles.accents} role="group" aria-labelledby="accent-label">
            <div class={styles["accents-head"]}>
              <span id="accent-label" class={styles.tag}>
                Try an accent
              </span>
              <code class={styles.hex}>{accentColor()}</code>
            </div>
            <div class={styles["accents-row"]}>
              <For each={Object.keys(accents) as Accent[]}>
                {(key) => (
                  <button
                    type="button"
                    class={styles.swatch}
                    style={{ background: accents[key][theme()] }}
                    aria-pressed={accent() === key ? "true" : "false"}
                    aria-label={accents[key].label}
                    title={accents[key].label}
                    onClick={() => pickAccent(key)}
                  />
                )}
              </For>
              <span class={styles.muted}>{accents[accent()].label}</span>
            </div>
          </div>
        </section>

        <section class={styles.grid} aria-label="Components">
          <form
            class={[styles.card, styles.tall]}
            data-flash={flash() === "form" ? "" : undefined}
            aria-labelledby="create-project"
            novalidate
            onSubmit={create}
          >
            <span class={styles.tag}>TextField · Select · Checkbox · Button</span>
            <div class={styles.heading}>
              <h2 id="create-project">Create project</h2>
              <p class={styles.muted}>Keep notes, links and files together.</p>
            </div>
            <TextField
              label="Project name"
              value={name()}
              onChange={setName}
              onFocusOut={() => setNameTouched(true)}
              description="Shown at the top of every page."
              errorMessage={nameTouched() && nameMissing() ? "Give the project a name." : undefined}
            />
            <Select
              label="Visibility"
              options={visibilities}
              value={visibility()}
              onChange={(value) => {
                setVisibility(value);
                notify("success", `Visibility: ${visibilities.find((v) => v.value === value)?.label}`);
              }}
            />
            <Checkbox
              label="Send a weekly summary"
              checked={weekly()}
              onChange={(on) => {
                setWeekly(on);
                notify("success", on ? "Weekly summary turned on" : "Weekly summary turned off");
              }}
            />
            <div class={styles.footer}>
              <Button variant="ghost" label="Reset" onClick={reset} />
              <Button type="submit" label="Create project" loading={creating()} loadingText="Creating…" />
            </div>
          </form>

          <div class={[styles.card, styles.tall]} data-flash={flash() === "calendar" ? "" : undefined}>
            <span class={styles.tag}>DatePicker</span>
            <DatePicker
              locale="en-GB"
              value={due()}
              onChange={(date) => {
                setDue(date);
                if (date) notify("success", `Due date set to ${day.format(date)}`);
              }}
            >
              <DatePicker.Label>Due date</DatePicker.Label>
              <DatePicker.Control>
                <DatePicker.Input />
              </DatePicker.Control>
              {/* The calendar stays open here, so it sits in the card instead of floating. */}
              <div class={styles.calendar}>
                <DatePicker.Header>
                  <DatePicker.PrevTrigger />
                  <DatePicker.Heading />
                  <DatePicker.NextTrigger />
                </DatePicker.Header>
                <DatePicker.Grid />
              </div>
            </DatePicker>
          </div>

          <div class={[styles.card, styles.tall]}>
            <div class={styles["card-head"]}>
              <span class={styles.tag}>Command</span>
              <span class={styles.muted}>Click to run</span>
            </div>
            <div
              ref={commandBox}
              class={styles.command}
              data-typing={typing() ? "" : undefined}
              onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
              onPointerDown={stopTyping}
              onFocusIn={(event) => {
                if (event.isTrusted) stopTyping();
              }}
            >
              <Command items={items()} empty={`No commands match “${query().trim()}”.`} />
              <span ref={caret} class={styles.caret} aria-hidden="true">
                <span class={styles.ghost}>{query()}</span>
              </span>
            </div>
          </div>

          <div class={[styles.card, styles["toast-card"]]}>
            <div class={styles["card-head"]}>
              <span class={styles.tag}>Toast</span>
              <span class={styles.muted}>{shown() === 1 ? "1 so far" : `${shown()} so far`}</span>
            </div>
            <Toaster
              class={styles.toaster}
              position="top-left"
              duration={Number.POSITIVE_INFINITY}
              aria-label="Notifications from this page"
            />
          </div>

          <div class={styles.card} data-flash={flash() === "tabs" ? "" : undefined}>
            <span class={styles.tag}>Tabs · Pagination</span>
            <Tabs
              class={styles.tabs}
              aria-label="Notes"
              value={tab()}
              onChange={(value) => setTab(value as Tab)}
              tabs={tabs}
            />
            <Pagination
              class={styles.pagination}
              count={8}
              defaultPage={1}
              showLabels={false}
              aria-label="Note pages"
            />
          </div>

          <div class={[styles.card, styles.members]}>
            <div class={styles["card-head"]}>
              <span class={styles.tag}>Item · Tooltip</span>
              <span class={styles.muted}>{project() ? `In ${project()}` : "Members"}</span>
            </div>
            <For each={members}>
              {(member) => (
                <Item
                  size="sm"
                  media={member.initials}
                  mediaVariant="avatar"
                  title={member.name}
                  description={member.role}
                  actions={
                    member.role !== "Owner" && (
                      <Tooltip
                        trigger={{
                          icon: <CloseIcon />,
                          variant: "ghost",
                          size: "sm",
                          "aria-label": `Remove ${member.name}`,
                          onClick: () => notify("error", `Only the owner can remove ${member.name.split(" ")[0]}`),
                        }}
                        content="Remove from project"
                      />
                    )
                  }
                />
              )}
            </For>
          </div>
        </section>
      </main>
    </div>
  );
}
