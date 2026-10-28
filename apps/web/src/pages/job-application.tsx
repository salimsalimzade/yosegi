import type { JSX } from "@solidjs/web";
import { createMemo, createSignal, flush, For, onCleanup, Show } from "solid-js";
import * as v from "valibot";
import {
  Button,
  Checkbox,
  ChevronLeftIcon,
  Combobox,
  DatePicker,
  NumberField,
  Select,
  Stepper,
  type StepperStep,
  TextField,
  TickIcon,
  Toaster,
  toast,
} from "yosegi-solid";
import { ExampleBar } from "../components/example-bar";
import { SiteHeader } from "../components/site-header";
import {
  cities,
  labelOf,
  longDate,
  monthsFromToday,
  needsPortfolio,
  positions,
  sources,
  startOfToday,
} from "../data/careers";
import styles from "./job-application.module.scss";

// ------------------------------------------------------------------- Schemas

/** Everything the form holds. Empty fields are "", null or NaN, as the fields report them. */
interface Application {
  name: string;
  email: string;
  phone: string;
  city: string | null;
  position: string | null;
  years: number;
  start: Date | null;
  portfolio: string;
  why: string;
  source: string | null;
  consent: boolean;
}

const blank = (): Application => ({
  name: "",
  email: "",
  phone: "",
  city: null,
  position: null,
  years: Number.NaN,
  start: null,
  portfolio: "",
  why: "",
  source: null,
  consent: false,
});

const isUrl = (text: string) => /^https?:\/\//.test(text) && URL.canParse(text);
const WHY_MIN = 80;
const WHY_MAX = 1000;

// One schema per step. A field's first message is the one it shows.
const schemas = {
  contact: v.object({
    name: v.pipe(v.string(), v.trim(), v.nonEmpty("Enter your full name."), v.minLength(2, "Enter your full name.")),
    email: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("Enter your email address."),
      v.email("Enter an email address like name@example.com."),
    ),
    phone: v.pipe(
      v.string(),
      v.trim(),
      v.check(
        (phone) => phone === "" || /^\+?[\d\s().-]{7,20}$/.test(phone),
        "Enter a phone number like +81 75 123 4567.",
      ),
    ),
    city: v.string("Choose the city you live in."),
  }),
  role: v.pipe(
    v.object({
      position: v.string("Choose the role you're applying for."),
      years: v.pipe(
        v.number("Enter your years of experience, or 0."),
        v.integer("Enter whole years."),
        v.minValue(0, "Enter 0 or more years."),
        v.maxValue(50, "Enter 50 years or fewer."),
      ),
      start: v.pipe(
        v.date("Choose the first day you could start."),
        v.minValue(startOfToday(), "Choose today or a later day."),
        v.maxValue(monthsFromToday(6), "Choose a day in the next 6 months."),
      ),
      portfolio: v.pipe(
        v.string(),
        v.trim(),
        v.check((link) => link === "" || isUrl(link), "Enter a link that starts with https://."),
      ),
    }),
    // Only design and engineering roles need a link, so this checks two fields together.
    v.forward(
      v.partialCheck(
        [["position"], ["portfolio"]],
        (input) => !needsPortfolio(input.position) || input.portfolio !== "",
        "Add a link to your work: this role asks for one.",
      ),
      ["portfolio"],
    ),
  ),
  motivation: v.object({
    why: v.pipe(
      v.string(),
      v.trim(),
      v.nonEmpty("Tell us why you'd like to work here."),
      v.minLength(WHY_MIN, (issue) => `Write at least ${WHY_MIN} characters, ${WHY_MIN - issue.input.length} to go.`),
      v.maxLength(WHY_MAX, (issue) => `Keep it to ${WHY_MAX} characters, ${issue.input.length - WHY_MAX} too many.`),
    ),
    source: v.nullable(v.string()),
  }),
  review: v.object({
    consent: v.literal(true, "Agree to this so we can read your application."),
  }),
};

type StepValue = keyof typeof schemas;
type Errors = Partial<Record<keyof Application, string>>;

const order: StepValue[] = ["contact", "role", "motivation", "review"];

/** Each field's first message for one step, or nothing when the step is fine. */
function check(step: StepValue, values: Application): Errors {
  const result = v.safeParse(schemas[step], values);
  if (result.success) return {};
  const nested: Record<string, string[] | undefined> = v.flatten(result.issues).nested ?? {};
  return Object.fromEntries(Object.entries(nested).map(([field, messages]) => [field, messages?.[0]]));
}

const count = (errors: Errors) => Object.keys(errors).length;

// -------------------------------------------------------------------- Pieces

/** A step's title, which takes focus when the step opens, and a line on what it's for. */
function StepHeading(props: { title: string; children: JSX.Element }) {
  return (
    <div class={styles["step-heading"]}>
      <h2 tabindex={-1}>{props.title}</h2>
      <p class={styles.muted}>{props.children}</p>
    </div>
  );
}

/** One part of the review: what was entered, and a way back to change it. */
function Summary(props: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <section class={styles.summary}>
      <div class={styles["summary-head"]}>
        <h3>{props.title}</h3>
        <Button
          variant="ghost"
          size="sm"
          label="Edit"
          aria-label={`Edit ${props.title.toLowerCase()}`}
          onClick={props.onEdit}
        />
      </div>
      <dl>
        {/* Keyed by label: the rows are new arrays on every change, but the same rows. */}
        <For each={props.rows} keyed={(row) => row[0]}>
          {(row) => (
            <div class={styles.row}>
              <dt>{row()[0]}</dt>
              <dd>{row()[1]}</dd>
            </div>
          )}
        </For>
      </dl>
    </section>
  );
}

// ---------------------------------------------------------------------- Page

/** A job application in four steps, each checked with valibot before the next one opens. */
export function JobApplication() {
  const [values, setValues] = createSignal<Application>(blank());
  const [step, setStep] = createSignal<StepValue>("contact");
  // The steps people have tried to leave. Their errors show from then on, and clear as they're fixed.
  const [checked, setChecked] = createSignal<StepValue[]>([]);
  const [sending, setSending] = createSignal(false);
  const [sent, setSent] = createSignal(false);
  let form: HTMLFormElement | undefined;
  let done: HTMLHeadingElement | undefined;

  const timers = new Set<ReturnType<typeof setTimeout>>();
  onCleanup(() => timers.forEach(clearTimeout));

  const set =
    <K extends keyof Application>(key: K) =>
    (value: Application[K]) =>
      setValues((previous) => ({ ...previous, [key]: value }));

  const errors = createMemo(
    () => Object.fromEntries(order.map((s) => [s, check(s, values())])) as Record<StepValue, Errors>,
  );
  /** A step's errors, once people have tried to leave it. */
  const shown = (s: StepValue): Errors => (checked().includes(s) ? errors()[s] : {});
  const markChecked = (steps: StepValue[]) => setChecked((list) => [...new Set([...list, ...steps])]);

  const index = () => order.indexOf(step());
  const isLast = () => index() === order.length - 1;

  /** After a move, the first field to fix takes focus, or else the step's title. */
  const focusStep = () => {
    flush();
    const content = form?.querySelector<HTMLElement>(".yosegi-stepper-content:not([hidden])");
    (content?.querySelector<HTMLElement>('[aria-invalid="true"]') ?? content?.querySelector("h2"))?.focus();
  };

  const goTo = (next: StepValue) => {
    setStep(next);
    focusStep();
  };

  const next = () => {
    markChecked([step()]);
    if (count(check(step(), values())) === 0) setStep(order[index() + 1]);
    focusStep();
  };

  const send = () => {
    // Check every step: a step fixed earlier may have been changed since.
    const broken = order.filter((s) => count(check(s, values())) > 0);
    if (broken.length > 0) {
      markChecked(broken);
      goTo(broken[0]);
      return;
    }
    setSending(true);
    const timer = setTimeout(() => {
      timers.delete(timer);
      setSending(false);
      setSent(true);
      // The button that had focus is gone; the thank-you takes it.
      flush();
      done?.focus();
      toast.success("Application sent", { description: "We'll reply within 5 working days." });
    }, 1400);
    timers.add(timer);
  };

  const startAgain = () => {
    setValues(blank());
    setChecked([]);
    setStep("contact");
    setSent(false);
  };

  // ------------------------------------------------------------------ Steps

  // Each one closes over the page's values, so the Stepper can create it once and keep it mounted.

  const ContactStep = () => (
    <div class={styles.step}>
      <StepHeading title="Contact details">How we'll reach you about this application.</StepHeading>
      <div class={styles.fields}>
        <TextField
          label="Full name"
          required
          autocomplete="name"
          value={values().name}
          onChange={set("name")}
          errorMessage={shown("contact").name}
        />
        <TextField
          label="Email"
          type="email"
          required
          autocomplete="email"
          placeholder="name@example.com"
          value={values().email}
          onChange={set("email")}
          errorMessage={shown("contact").email}
        />
        <TextField
          label="Phone"
          type="tel"
          autocomplete="tel"
          description="Optional, with the country code."
          value={values().phone}
          onChange={set("phone")}
          errorMessage={shown("contact").phone}
        />
        <Combobox
          label="City"
          required
          options={cities}
          placeholder="Choose a city"
          value={values().city}
          onChange={(city) => set("city")(city)}
          errorMessage={shown("contact").city}
        />
      </div>
    </div>
  );

  const RoleStep = () => (
    <div class={styles.step}>
      <StepHeading title="The role">Which job you'd like, and when you could start.</StepHeading>
      <div class={styles.fields}>
        <Select
          label="Role"
          required
          options={positions}
          placeholder="Choose a role"
          value={values().position}
          onChange={set("position")}
          errorMessage={shown("role").position}
        />
        <NumberField
          label="Years of experience"
          required
          minValue={0}
          maxValue={50}
          value={values().years}
          onChange={set("years")}
          errorMessage={shown("role").years}
        />
        <DatePicker
          label="Earliest start date"
          required
          minValue={startOfToday()}
          maxValue={monthsFromToday(6)}
          value={values().start}
          onChange={set("start")}
          description="Any day in the next 6 months."
          errorMessage={shown("role").start}
        />
        <TextField
          label="Portfolio or profile"
          type="url"
          required={needsPortfolio(values().position)}
          placeholder="https://"
          description={
            needsPortfolio(values().position)
              ? "This role asks for a link to your work."
              : "Optional: a website, GitHub or LinkedIn."
          }
          value={values().portfolio}
          onChange={set("portfolio")}
          errorMessage={shown("role").portfolio}
        />
      </div>
    </div>
  );

  const MotivationStep = () => (
    <div class={styles.step}>
      <StepHeading title="About you">A few lines in your own words. No cover letter needed.</StepHeading>
      <div class={styles.stack}>
        <TextField
          label="Why Kissa Tea?"
          required
          multiline
          placeholder="What draws you to tea, to us, or to this role?"
          description={`${values().why.trim().length} of ${WHY_MAX} characters, at least ${WHY_MIN}.`}
          value={values().why}
          onChange={set("why")}
          errorMessage={shown("motivation").why}
        />
        <Select
          label="How did you hear about us?"
          options={sources}
          placeholder="Choose one"
          description="Optional."
          value={values().source}
          onChange={set("source")}
        />
      </div>
    </div>
  );

  const ReviewStep = () => (
    <div class={styles.step}>
      <StepHeading title="Review">Check everything, then send it.</StepHeading>
      <div class={styles.stack}>
        <Summary
          title="Contact details"
          onEdit={() => goTo("contact")}
          rows={[
            ["Name", values().name || "—"],
            ["Email", values().email || "—"],
            ["Phone", values().phone || "—"],
            ["City", labelOf(cities, values().city)],
          ]}
        />
        <Summary
          title="The role"
          onEdit={() => goTo("role")}
          rows={[
            ["Role", labelOf(positions, values().position)],
            ["Experience", Number.isNaN(values().years) ? "—" : `${values().years} years`],
            ["Start", values().start ? longDate.format(values().start!) : "—"],
            ["Portfolio", values().portfolio || "—"],
          ]}
        />
        <Summary
          title="About you"
          onEdit={() => goTo("motivation")}
          rows={[
            ["Why Kissa Tea", values().why || "—"],
            ["Heard from", labelOf(sources, values().source)],
          ]}
        />
        <Checkbox
          label="Kissa Tea may keep my application for 6 months"
          description="We only use it to get back to you about this role, and delete it after."
          required
          checked={values().consent}
          onChange={set("consent")}
          errorMessage={shown("review").consent}
        />
      </div>
    </div>
  );

  const definitions = [
    { value: "contact", label: "Contact", description: "About you", content: ContactStep },
    { value: "role", label: "Role", description: "The job", content: RoleStep },
    { value: "motivation", label: "Motivation", description: "Why us", content: MotivationStep },
    { value: "review", label: "Review", description: "Check and send", content: ReviewStep },
  ] satisfies (StepperStep & { value: StepValue })[];

  // New objects on every change, but the same content, so the Stepper keeps each step's form mounted.
  const steps = createMemo(() =>
    definitions.map((definition): StepperStep => {
      const problems = count(shown(definition.value));
      if (sending() && definition.value === "review") return { ...definition, state: "loading" };
      if (problems === 0) return definition;
      return {
        ...definition,
        state: "error",
        description: problems === 1 ? "Fix 1 field" : `Fix ${problems} fields`,
      };
    }),
  );

  return (
    <div class={styles.root}>
      <SiteHeader />
      <ExampleBar title="Job application" file="job-application.tsx" />

      <main class={styles.main}>
        <aside class={styles.posting}>
          <div class={styles.shop}>
            <span class={styles.logo} aria-hidden="true">
              K
            </span>
            <div>
              <div class={styles["shop-name"]}>Kissa Tea</div>
              <div class={styles.muted}>Careers</div>
            </div>
          </div>
          <div class={styles.intro}>
            <h1>Work with us</h1>
            <p class={styles.muted}>
              A small tea shop in Kyoto, with an online store that ships worldwide. We're looking for people in the shop
              and in the office.
            </p>
          </div>
          <div class={styles.next}>
            <h2>What happens next</h2>
            <ol>
              <li>We read every application within 5 working days.</li>
              <li>A 30-minute call, to get to know each other.</li>
              <li>A paid trial day, in the shop or with the team.</li>
            </ol>
          </div>
        </aside>

        <div class={styles.card}>
          <Show
            when={!sent()}
            fallback={
              <div class={styles.done}>
                <span class={styles.badge} aria-hidden="true">
                  <TickIcon />
                </span>
                <h2 ref={(el: HTMLHeadingElement) => (done = el)} tabindex={-1}>
                  Application sent
                </h2>
                <p class={styles.muted}>
                  Thank you, {values().name.trim().split(" ")[0]}. We'll write to {values().email.trim()} within 5
                  working days.
                </p>
                <Button variant="outline" label="Start a new application" onClick={startAgain} />
              </div>
            }
          >
            <form
              ref={(el: HTMLFormElement) => (form = el)}
              class={styles.form}
              novalidate
              onSubmit={(event) => {
                event.preventDefault();
                if (sending()) return;
                if (isLast()) send();
                else next();
              }}
            >
              <Stepper
                aria-label="Job application"
                value={step()}
                onChange={(value) => {
                  if (sending()) return;
                  // Moving ahead from a step shows what's wrong with it, as Continue does.
                  if (order.indexOf(value as StepValue) > index()) markChecked([step()]);
                  setStep(value as StepValue);
                }}
                steps={steps()}
              />
              <div class={styles.footer}>
                <Show when={index() > 0}>
                  <Button
                    variant="ghost"
                    label="Back"
                    icon={<ChevronLeftIcon />}
                    disabled={sending()}
                    onClick={() => goTo(order[index() - 1])}
                  />
                </Show>
                <span class={styles.progress}>
                  Step {index() + 1} of {order.length}
                </span>
                <Button
                  type="submit"
                  label={isLast() ? "Send application" : "Continue"}
                  loading={sending()}
                  loadingText="Sending…"
                />
              </div>
            </form>
          </Show>
        </div>
      </main>

      <Toaster aria-label="Notifications" position="top-right" />
    </div>
  );
}
