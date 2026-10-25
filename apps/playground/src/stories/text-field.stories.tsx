import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import { SearchIcon, TextField } from "yosegi-solid";

const meta = {
  title: "Forms/TextField",
  component: TextField,
  parameters: {
    stage: "field",
    docs: {
      description: {
        component: "A labelled single-line or multi-line text input with an optional hint and error message.",
      },
    },
  },
  args: {
    label: "Project name",
    placeholder: "e.g. Reading list",
    description: "You can change it later.",
    multiline: false,
    loading: false,
    disabled: false,
    readOnly: false,
    required: false,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    icon: { control: false },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** label, placeholder and description: the field builds its parts. */
export const Default: Story = {
  render: () => (
    <TextField label="Project name" placeholder="e.g. Reading list" description="You can change it later." />
  ),
};

/** Has a value. */
export const Filled: Story = {
  render: () => <TextField label="Project name" defaultValue="Reading list" description="You can change it later." />,
};

/** Validated after blur: errorMessage is set only then, and replaces the hint. Type a full address to fix it. */
export const Invalid: Story = {
  render: () => {
    const [email, setEmail] = createSignal("hello@");
    const [touched, setTouched] = createSignal(true);
    const invalid = () => touched() && !/^\S+@\S+\.\S+$/.test(email());
    return (
      <TextField
        label="Email"
        type="email"
        value={email()}
        onChange={setEmail}
        onFocusOut={() => setTouched(true)}
        description="We'll send the invite here."
        errorMessage={invalid() ? "Enter a full email address." : undefined}
      />
    );
  },
};

/** Can't be used; say why in the hint. */
export const Disabled: Story = {
  render: () => (
    <TextField label="Folder" disabled defaultValue="Personal" description="Folders are locked while syncing." />
  ),
};

/** Shown, not edited; it can still be copied and is sent with the form. */
export const ReadOnly: Story = {
  name: "Read-only",
  render: () => (
    <TextField
      label="Project ID"
      readOnly
      defaultValue="prj_8f2c11"
      description="Set by Yosegi; copy it, don't edit it."
    />
  ),
};

/** icon puts a 16px icon before the text, like the search glass. */
export const LeadingIcon: Story = {
  name: "Leading icon",
  render: () => (
    <TextField icon={<SearchIcon />} type="search" placeholder="Search invoices" aria-label="Search invoices" />
  ),
};

/** Something about the value is being checked: a spinner, and the field stays usable. */
export const Loading: Story = {
  render: () => (
    <TextField label="Username" loading defaultValue="salim" description="Checking that the name is free…" />
  ),
};

/** multiline: several lines, growing with the text. */
export const TextArea: Story = {
  name: "Text area",
  render: () => <TextField label="Notes" multiline placeholder="Anything to remember?" />,
};

/** Marked required, so the browser and screen readers know. */
export const Required: Story = {
  render: () => <TextField label="Title" required placeholder="Give the note a title" />,
};

/** The same field built from its parts, for full control over the markup. */
export const FromParts: Story = {
  name: "From parts",
  render: () => {
    const [name, setName] = createSignal("");
    return (
      <TextField value={name()} onChange={setName} validationState={name() ? "valid" : "invalid"}>
        <TextField.Label>Project name</TextField.Label>
        <TextField.Input />
        <TextField.Description>You can change it later.</TextField.Description>
        <TextField.ErrorMessage>Give the project a name.</TextField.ErrorMessage>
      </TextField>
    );
  },
};
