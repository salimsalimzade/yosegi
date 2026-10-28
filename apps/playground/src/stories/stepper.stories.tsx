import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, For } from "solid-js";
import { Button, FileIcon, ListIcon, SettingsIcon, ShareIcon, Stepper } from "yosegi-solid";

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
    linear: true,
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
    connector: { control: "inline-radio", options: ["gap", "joined"] },
    steps: { control: "object" },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/**
 * Back and Next move through the flow. Done steps can be clicked to go back; with linear (the default),
 * upcoming ones can't be picked until they're reached.
 */
export const Numbered: Story = {
  render: () => {
    const order = ["details", "members", "settings", "review"];
    const [step, setStep] = createSignal("members");
    const at = () => order.indexOf(step());
    return (
      <div style={{ display: "grid", gap: "24px", width: "100%", "max-width": "640px" }}>
        <Stepper
          aria-label="Create project"
          value={step()}
          onChange={setStep}
          steps={[
            { value: "details", label: "Details" },
            { value: "members", label: "Members" },
            { value: "settings", label: "Settings" },
            { value: "review", label: "Review" },
          ]}
        />
        <div style={{ display: "flex", "justify-content": "flex-end", gap: "8px" }}>
          <Button label="Back" variant="outline" disabled={at() === 0} onClick={() => setStep(order[at() - 1])} />
          <Button
            label={at() === order.length - 1 ? "Create project" : "Next"}
            disabled={at() === order.length - 1}
            onClick={() => setStep(order[at() + 1])}
          />
        </div>
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

/** linear={false}: any step can be picked, in any order, as in a settings flow people come back to. */
export const NonLinear: Story = {
  name: "Non-linear",
  render: () => (
    <Stepper
      aria-label="Profile"
      linear={false}
      defaultValue="details"
      style={{ width: "100%", "max-width": "640px" }}
      steps={[
        { value: "details", label: "Details" },
        { value: "photo", label: "Photo" },
        { value: "privacy", label: "Privacy" },
      ]}
    />
  ),
};

/** The parts, for a step that needs more than steps can say: here, a description that appears with the error. */
export const FromParts: Story = {
  name: "From parts",
  render: () => {
    const [invalid, setInvalid] = createSignal(true);
    return (
      <div style={{ display: "grid", gap: "24px", width: "100%", "max-width": "640px" }}>
        <Stepper aria-label="Create project" defaultValue="settings">
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
