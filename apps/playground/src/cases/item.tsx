import { For } from "solid-js";
import { Button, ChevronRightIcon, FileIcon, Item, PlusIcon, ShieldIcon, TickIcon } from "yosegi";
import { Case, Cases } from "../ui/case";

const people = [
  { initials: "SS", name: "Salim", email: "salim@yosegi.dev" },
  { initials: "AK", name: "Aiko", email: "aiko@yosegi.dev" },
  { initials: "MT", name: "Mateo", email: "mateo@yosegi.dev" },
];

export function ItemPage() {
  return (
    <>
      <Case title="Variants" description="default is plain, outline adds a border, muted fills it." layout="stack">
        <For each={["default", "outline", "muted"] as const}>
          {(variant) => (
            <Item variant={variant} style={{ width: "100%" }}>
              <Item.Content>
                <Item.Title>{variant[0].toUpperCase() + variant.slice(1)} item</Item.Title>
                <Item.Description>A title, a description and one action.</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Button label="Open" size="sm" variant="outline" />
              </Item.Actions>
            </Item>
          )}
        </For>
      </Case>

      <Case title="Sizes" description="md (default), sm and xs for dense lists; media shrinks with them." layout="stack">
        <For each={["md", "sm", "xs"] as const}>
          {(size) => (
            <Item variant="outline" size={size} style={{ width: "100%" }}>
              <Item.Media variant="icon">
                <FileIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>Size {size}</Item.Title>
              </Item.Content>
            </Item>
          )}
        </For>
      </Case>

      <Cases>
        <Case title="With an icon and an action" layout="fill">
          <Item variant="outline">
            <Item.Media variant="icon">
              <ShieldIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>New sign-in</Item.Title>
              <Item.Description>From an unknown device in Kyoto.</Item.Description>
            </Item.Content>
            <Item.Actions>
              <Button label="Review" size="sm" />
            </Item.Actions>
          </Item>
        </Case>

        <Case title="As a link" description='as="a": the whole row is the link.' layout="fill">
          <Item as="a" href="#item" variant="muted" size="sm">
            <Item.Media variant="icon">
              <TickIcon />
            </Item.Media>
            <Item.Content>
              <Item.Title>Your profile is verified</Item.Title>
            </Item.Content>
            <Item.Actions>
              <ChevronRightIcon />
            </Item.Actions>
          </Item>
        </Case>

        <Case title="A list of people" description="Group and Separator, avatar media, a selected row and a disabled one." layout="fill">
          <Item.Group>
            <For each={people}>
              {(person, index) => (
                <>
                  {index() > 0 && <Item.Separator />}
                  <Item size="sm" selected={index() === 0} disabled={index() === 2}>
                    <Item.Media variant="avatar">{person.initials}</Item.Media>
                    <Item.Content>
                      <Item.Title>{person.name}</Item.Title>
                      <Item.Description>{person.email}</Item.Description>
                    </Item.Content>
                    <Item.Actions>
                      <Button size="sm" variant="ghost" icon={<PlusIcon />} aria-label={`Invite ${person.name}`} />
                    </Item.Actions>
                  </Item>
                </>
              )}
            </For>
          </Item.Group>
        </Case>

        <Case title="Header and footer" description="Full lines above and below the row." layout="fill">
          <Item variant="outline">
            <Item.Header>
              <Item.Title>Trip to Kyoto</Item.Title>
              <Button label="Edit" size="sm" variant="ghost" />
            </Item.Header>
            <Item.Content>
              <Item.Description>Temples in the morning, long lunches, slow trains.</Item.Description>
            </Item.Content>
            <Item.Footer>
              <span style={{ font: "var(--yosegi-text-small)", color: "var(--yosegi-color-fg-muted)" }}>4 notes · edited yesterday</span>
            </Item.Footer>
          </Item>
        </Case>
      </Cases>
    </>
  );
}
