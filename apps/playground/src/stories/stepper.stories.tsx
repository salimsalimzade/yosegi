import type { JSX } from "@solidjs/web";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, For } from "solid-js";
import {
  Button,
  FileIcon,
  ListIcon,
  SettingsIcon,
  ShareIcon,
  Stepper,
  type StepperNavigation,
  TextField,
} from "yosegi-solid";

const meta = {
  title: "Navigation/Stepper",
  component: Stepper,
  parameters: {
    stage: "fill",
    docs: {
      description: {
        component:
          "The steps of a short flow, showing what is done, where you are and what is left. Keep it to 3 to 5 steps with one- or two-word labels.",
      },
    },
  },
  args: {
    "aria-label": "Create project",
    defaultValue: "members",
    orientation: "horizontal",
    variant: "number",
    size: "md",
    navigation: "reached",
    connector: "gap",
    steps: [
      { value: "details", label: "Details" },
      { value: "members", label: "Members" },
      { value: "settings", label: "Settings" },
      { value: "review", label: "Review" },
    ],
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    variant: { control: "inline-radio", options: ["number", "icon"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    navigation: { control: "inline-radio", options: ["all", "reached", "none"] },
    connector: { control: "inline-radio", options: ["gap", "joined"] },
    steps: { control: "object" },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Stands in for a real step's form in With step content. */
const StepPanel = (props: { title: string; children: JSX.Element }) => (
  <section
    style={{
      display: "grid",
      gap: "var(--yosegi-space-100)",
      padding: "var(--yosegi-space-400)",
      border: "1px solid var(--yosegi-color-border)",
      "border-radius": "var(--yosegi-radius-300)",
      background: "var(--yosegi-color-bg-surface)",
    }}
  >
    <h3 style={{ margin: 0, "font-weight": 600 }}>{props.title}</h3>
    <div style={{ color: "var(--yosegi-color-fg-muted)" }}>{props.children}</div>
  </section>
);
const DetailsStep = () => (
  <StepPanel title="Details">
    <TextField label="Project name" placeholder="Website redesign" />
  </StepPanel>
);
const MembersStep = () => <StepPanel title="Members">Invite the people who can edit it.</StepPanel>;
const SettingsStep = () => <StepPanel title="Settings">Notifications and access.</StepPanel>;
const ReviewStep = () => <StepPanel title="Review">Check everything, then create the project.</StepPanel>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Click a step's number to go back or forward to it; value and onChange keep the app in step. */
export const Numbered: Story = {
  render: () => {
    const [step, setStep] = createSignal("members");
    return (
      <div style={{ display: "grid", gap: "24px", width: "100%", "max-width": "640px" }}>
        <Stepper
          aria-label="Create project"
          navigation="all"
          value={step()}
          onChange={setStep}
          steps={[
            { value: "details", label: "Details" },
            { value: "members", label: "Members" },
            { value: "settings", label: "Settings" },
            { value: "review", label: "Review" },
          ]}
        />
        <p style={{ margin: 0, color: "var(--yosegi-color-fg-muted)" }}>value = "{step()}"</p>
      </div>
    );
  },
};

/** state="error" marks the step with ! and says what to fix, never with colour alone. Show one error at a time. */
export const WithAnError: Story = {
  name: "With an error",
  render: () => (
    <Stepper
      aria-label="Create project"
      defaultValue="settings"
      style={{ width: "100%", "max-width": "640px" }}
      steps={[
        { value: "details", label: "Details" },
        { value: "members", label: "Members", state: "error", description: "Fix 1 field" },
        { value: "settings", label: "Settings" },
        { value: "review", label: "Review" },
      ]}
    />
  ),
};

/** variant="icon" shows each step's icon; a short description says what the step is for. */
export const IconsWithDescriptions: Story = {
  name: "Icons with descriptions",
  render: () => (
    <Stepper
      aria-label="Create project"
      variant="icon"
      defaultValue="members"
      style={{ width: "100%", "max-width": "720px" }}
      steps={[
        { value: "details", label: "Details", description: "Name and visibility", icon: <FileIcon /> },
        { value: "members", label: "Members", description: "Who can edit", icon: <ShareIcon /> },
        { value: "settings", label: "Settings", description: "Notifications", icon: <SettingsIcon /> },
        { value: "review", label: "Review", description: "Check and create", icon: <ListIcon /> },
      ]}
    />
  ),
};

/**
 * For side panels and long settings flows. status writes a line from the state; loading turns the
 * indicator into a Spinner, optional comes before the description, and a disabled step says why.
 */
export const Vertical: Story = {
  render: () => (
    <Stepper
      aria-label="Set up workspace"
      orientation="vertical"
      variant="icon"
      defaultValue="settings"
      style={{ width: "100%", "max-width": "360px" }}
      steps={[
        { value: "details", label: "Details", description: "Name and visibility", icon: <FileIcon />, status: true },
        {
          value: "members",
          label: "Members",
          description: "Invite people later",
          icon: <ShareIcon />,
          optional: true,
          status: true,
        },
        {
          value: "settings",
          label: "Settings",
          description: "Notifications and access",
          icon: <SettingsIcon />,
          state: "loading",
          status: true,
        },
        {
          value: "billing",
          label: "Billing",
          description: "Plan and invoices",
          icon: <ListIcon />,
          disabled: true,
          status: "Needs owner access",
        },
      ]}
    />
  ),
};

/** sm for dialogs and dense places, md by default, lg for a page that is only the flow. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "40px", width: "100%", "max-width": "640px" }}>
      <For each={["sm", "md", "lg"] as const}>
        {(size) => (
          <Stepper
            aria-label={`Create project, ${size}`}
            size={size}
            defaultValue="settings"
            steps={[
              { value: "details", label: "Details" },
              { value: "members", label: "Members" },
              { value: "settings", label: "Settings" },
              { value: "review", label: "Review" },
            ]}
          />
        )}
      </For>
    </div>
  ),
};

/** connector="joined" runs the line into the indicators, so the steps read as one track. */
export const JoinedConnector: Story = {
  name: "Joined connector",
  render: () => (
    <div style={{ display: "flex", "flex-wrap": "wrap", gap: "64px", width: "100%" }}>
      <Stepper
        aria-label="Create project"
        connector="joined"
        defaultValue="review"
        style={{ flex: "1 1 400px" }}
        steps={[
          { value: "details", label: "Details" },
          { value: "members", label: "Members" },
          { value: "settings", label: "Settings" },
          { value: "review", label: "Review" },
        ]}
      />
      <Stepper
        aria-label="Publish"
        connector="joined"
        orientation="vertical"
        defaultValue="check"
        steps={[
          { value: "write", label: "Write", description: "Draft the post" },
          { value: "check", label: "Check", description: "Links and images" },
          { value: "publish", label: "Publish", description: "Share it" },
        ]}
      />
    </div>
  ),
};

/**
 * Which steps a click can move to. all: any of them, as in a settings flow people come back to.
 * reached (the default): back to any step, and forward as far as people have been; here a saved
 * draft got to Settings, so Review stays locked. none: nothing can be clicked, so it only shows progress.
 */
export const Navigation: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "40px", width: "100%", "max-width": "640px" }}>
      <For
        each={
          [
            { navigation: "all", note: "Any step can be clicked." },
            { navigation: "reached", note: "Details to Settings can be clicked; Review can't, until it's reached." },
            { navigation: "none", note: "Nothing can be clicked." },
          ] as { navigation: StepperNavigation; note: string }[]
        }
      >
        {(mode) => (
          <div style={{ display: "grid", gap: "16px" }}>
            <Stepper
              aria-label={`Create project, navigation ${mode.navigation}`}
              navigation={mode.navigation}
              defaultValue="members"
              reached="settings"
              steps={[
                { value: "details", label: "Details" },
                { value: "members", label: "Members" },
                { value: "settings", label: "Settings" },
                { value: "review", label: "Review" },
              ]}
            />
            <p style={{ margin: 0, color: "var(--yosegi-color-fg-muted)" }}>
              <code>navigation="{mode.navigation}"</code>: {mode.note}
            </p>
          </div>
        )}
      </For>
    </div>
  ),
};

/**
 * Give each step its content and the Stepper shows the current one under the steps. The others stay
 * mounted but hidden, so a project name typed in Details is still there after a trip to Review.
 */
export const WithStepContent: Story = {
  name: "With step content",
  render: () => (
    <Stepper
      aria-label="Create project"
      navigation="all"
      style={{ width: "100%", "max-width": "640px" }}
      steps={[
        { value: "details", label: "Details", content: DetailsStep },
        { value: "members", label: "Members", content: MembersStep },
        { value: "settings", label: "Settings", content: SettingsStep },
        { value: "review", label: "Review", content: ReviewStep },
      ]}
    />
  ),
};

/**
 * The parts, for a step that needs more than steps can say: here, a description that appears with the
 * error. Stepper.List holds the items; a Stepper.Content per step, after it, would hold their content.
 */
export const FromParts: Story = {
  name: "From parts",
  render: () => {
    const [invalid, setInvalid] = createSignal(true);
    return (
      <div style={{ display: "grid", gap: "24px", width: "100%", "max-width": "640px" }}>
        <Stepper defaultValue="settings">
          <Stepper.List aria-label="Create project">
            <Stepper.Item value="details">
              <Stepper.Trigger>
                <Stepper.Indicator />
                <Stepper.Label>Details</Stepper.Label>
              </Stepper.Trigger>
              <Stepper.Separator />
            </Stepper.Item>
            <Stepper.Item value="members" state={invalid() ? "error" : undefined}>
              <Stepper.Trigger>
                <Stepper.Indicator />
                <Stepper.Label>Members</Stepper.Label>
                {invalid() && <Stepper.Description>Fix 1 field</Stepper.Description>}
              </Stepper.Trigger>
              <Stepper.Separator />
            </Stepper.Item>
            <Stepper.Item value="settings">
              <Stepper.Trigger>
                <Stepper.Indicator />
                <Stepper.Label>Settings</Stepper.Label>
              </Stepper.Trigger>
              <Stepper.Separator />
            </Stepper.Item>
            <Stepper.Item value="review">
              <Stepper.Trigger>
                <Stepper.Indicator />
                <Stepper.Label>Review</Stepper.Label>
              </Stepper.Trigger>
            </Stepper.Item>
          </Stepper.List>
        </Stepper>
        <Button
          label={invalid() ? "Fix the field" : "Break it again"}
          variant="outline"
          onClick={() => setInvalid(!invalid())}
          style={{ "justify-self": "start" }}
        />
      </div>
    );
  },
};
