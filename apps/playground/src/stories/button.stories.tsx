import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { For } from "solid-js";
import { ArrowRightIcon, Button, DownloadIcon, InfoIcon, PlusIcon, SettingsIcon, TrashIcon } from "yosegi-solid";
import { createTask } from "../ui/task";

const meta = {
  title: "Actions/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "A single clickable action, with variants, sizes, an optional icon, and loading and disabled states.",
      },
    },
  },
  args: { label: "Save", variant: "solid", size: "md", iconPosition: "start", loading: false, disabled: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["solid", "outline", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    iconPosition: { control: "inline-radio", options: ["start", "end"] },
    label: { control: "text" },
    loadingText: { control: "text" },
    icon: { control: false },
    as: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Solid for the one main action; outline and ghost for the rest; danger for what can't be undone. */
export const Variants: Story = {
  render: () => (
    <>
      <Button label="Save" />
      <Button label="Cancel" variant="outline" />
      <Button label="Skip" variant="ghost" />
      <Button label="Delete" variant="danger" />
    </>
  ),
};

/** label is the text on the button; children work the same way. */
export const LabelAsChildren: Story = {
  name: "Label as children",
  render: () => (
    <>
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
    </>
  ),
};

/** sm 28px, md 36px (default), lg 44px. */
export const Sizes: Story = {
  render: () => (
    <>
      <Button label="Small" size="sm" />
      <Button label="Medium" />
      <Button label="Large" size="lg" />
    </>
  ),
};

/** icon sits at the start by default; iconPosition="end" for arrows. */
export const WithAnIcon: Story = {
  name: "With an icon",
  render: () => (
    <>
      <Button label="New note" icon={<PlusIcon />} />
      <Button label="Continue" variant="outline" icon={<ArrowRightIcon />} iconPosition="end" />
      <Button label="Download" variant="ghost" icon={<DownloadIcon />} />
      <Button label="Small" size="sm" variant="outline" icon={<PlusIcon />} />
      <Button label="Large" size="lg" icon={<PlusIcon />} />
    </>
  ),
};

const iconButtons = [
  { label: "Add note", icon: PlusIcon, variant: "solid", size: "md" },
  { label: "Settings", icon: SettingsIcon, variant: "outline", size: "md" },
  { label: "Download", icon: DownloadIcon, variant: "ghost", size: "md" },
  { label: "Delete", icon: TrashIcon, variant: "danger", size: "md" },
  { label: "Add, small", icon: PlusIcon, variant: "outline", size: "sm" },
  { label: "Add, large", icon: PlusIcon, variant: "outline", size: "lg" },
] as const;

/** An icon with no label makes a square button. It needs an aria-label. */
export const IconOnly: Story = {
  name: "Icon only",
  render: () => (
    <For each={iconButtons}>
      {(button) => (
        <Button icon={<button.icon />} variant={button.variant} size={button.size} aria-label={button.label} />
      )}
    </For>
  ),
};

/** Click one. The spinner takes the icon's place, and loadingText says what's happening. */
export const Loading: Story = {
  render: () => {
    const [saving, save] = createTask();
    const [exporting, exportNotes] = createTask();
    const [deleting, remove] = createTask();
    return (
      <>
        <Button label="Save" loading={saving()} loadingText="Saving…" onClick={save} />
        <Button
          label="Export notes"
          variant="outline"
          icon={<DownloadIcon />}
          loading={exporting()}
          loadingText="Exporting…"
          onClick={exportNotes}
        />
        <Button
          label="Delete project"
          variant="danger"
          icon={<TrashIcon />}
          loading={deleting()}
          loadingText="Deleting…"
          onClick={remove}
        />
      </>
    );
  },
};

/** Click one, or load them all. The spinner replaces the icon and the button stays square. */
export const IconOnlyLoading: Story = {
  name: "Icon only, loading",
  render: () => {
    const [allLoading, loadAll] = createTask(3000);
    const tasks = iconButtons.map(() => createTask());
    return (
      <>
        <For each={iconButtons}>
          {(button, index) => (
            <Button
              icon={<button.icon />}
              variant={button.variant}
              size={button.size}
              aria-label={button.label}
              loading={allLoading() || tasks[index()][0]()}
              onClick={tasks[index()][1]}
            />
          )}
        </For>
        <Button label="Load all" variant="ghost" size="sm" disabled={allLoading()} onClick={loadAll} />
      </>
    );
  },
};

/** 40% opacity; can't be focused or clicked. Say why nearby. */
export const Disabled: Story = {
  render: () => (
    <>
      <Button label="Save" disabled />
      <Button label="Cancel" variant="outline" disabled />
      <Button label="Skip" variant="ghost" disabled />
      <Button variant="outline" icon={<InfoIcon />} aria-label="Info" disabled />
    </>
  ),
};

/** as="a" keeps the look on an anchor. */
export const AsALink: Story = {
  name: "As a link",
  render: () => (
    <Button label="See pricing" as="a" href="#button" variant="outline" icon={<ArrowRightIcon />} iconPosition="end" />
  ),
};
