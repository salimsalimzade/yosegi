import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { For } from "solid-js";
import { Button, ChevronRightIcon, FileIcon, Item, PlusIcon, ShieldIcon, TickIcon } from "yosegi";

const people = [
  { initials: "SS", name: "Salim", email: "salim@yosegi.dev" },
  { initials: "AK", name: "Aiko", email: "aiko@yosegi.dev" },
  { initials: "MT", name: "Mateo", email: "mateo@yosegi.dev" },
];

const meta = {
  title: "Layout/Item",
  component: Item,
  parameters: {
    stage: "fill",
    docs: {
      description: {
        component:
          "A row of content with media, a title, a description and actions: a person, a file, a setting or a link.",
      },
    },
  },
  args: {
    title: "New sign-in",
    description: "From an unknown device in Kyoto.",
    variant: "outline",
    size: "md",
    mediaVariant: "icon",
    selected: false,
    disabled: false,
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    variant: { control: "inline-radio", options: ["default", "outline", "muted"] },
    size: { control: "inline-radio", options: ["md", "sm", "xs"] },
    mediaVariant: { control: "inline-radio", options: ["icon", "avatar", "image"] },
    media: { control: false },
    actions: { control: false },
  },
  render: (args) => <Item {...args} media={<ShieldIcon />} actions={<Button label="Review" size="sm" />} />,
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** default is plain, outline adds a border, muted fills it. */
export const Variants: Story = {
  parameters: { stage: "stack" },
  render: () => (
    <For each={["default", "outline", "muted"] as const}>
      {(variant) => (
        <Item
          variant={variant}
          style={{ width: "100%" }}
          title={`${variant[0].toUpperCase() + variant.slice(1)} item`}
          description="A title, a description and one action."
          actions={<Button label="Open" size="sm" variant="outline" />}
        />
      )}
    </For>
  ),
};

/** md (default), sm and xs for dense lists; media shrinks with them. */
export const Sizes: Story = {
  parameters: { stage: "stack" },
  render: () => (
    <For each={["md", "sm", "xs"] as const}>
      {(size) => (
        <Item
          variant="outline"
          size={size}
          style={{ width: "100%" }}
          media={<FileIcon />}
          mediaVariant="icon"
          title={`Size ${size}`}
        />
      )}
    </For>
  ),
};

export const WithAnIconAndAnAction: Story = {
  name: "With an icon and an action",
  render: () => (
    <Item
      variant="outline"
      media={<ShieldIcon />}
      mediaVariant="icon"
      title="New sign-in"
      description="From an unknown device in Kyoto."
      actions={<Button label="Review" size="sm" />}
    />
  ),
};

/** as="a": the whole row is the link. */
export const AsALink: Story = {
  name: "As a link",
  render: () => (
    <Item
      as="a"
      href="#item"
      variant="muted"
      size="sm"
      media={<TickIcon />}
      mediaVariant="icon"
      title="Your profile is verified"
      actions={<ChevronRightIcon />}
    />
  ),
};

/** Group and Separator, avatar media, a selected row and a disabled one. */
export const AListOfPeople: Story = {
  name: "A list of people",
  render: () => (
    <Item.Group>
      <For each={people}>
        {(person, index) => (
          <>
            {index() > 0 && <Item.Separator />}
            <Item
              size="sm"
              selected={index() === 0}
              disabled={index() === 2}
              media={person.initials}
              mediaVariant="avatar"
              title={person.name}
              description={person.email}
              actions={<Button size="sm" variant="ghost" icon={<PlusIcon />} aria-label={`Invite ${person.name}`} />}
            />
          </>
        )}
      </For>
    </Item.Group>
  ),
};

/** Full lines above and below the row: put the parts together for this one. */
export const HeaderAndFooter: Story = {
  name: "Header and footer",
  render: () => (
    <Item variant="outline">
      <Item.Header>
        <Item.Title>Trip to Kyoto</Item.Title>
        <Button label="Edit" size="sm" variant="ghost" />
      </Item.Header>
      <Item.Content>
        <Item.Description>Temples in the morning, long lunches, slow trains.</Item.Description>
      </Item.Content>
      <Item.Footer>
        <span style={{ font: "var(--yosegi-text-small)", color: "var(--yosegi-color-fg-muted)" }}>
          4 notes · edited yesterday
        </span>
      </Item.Footer>
    </Item>
  ),
};
