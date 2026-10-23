import { For } from "solid-js";
import { Button, Checkbox, Popover, type PopoverProps, ShareIcon, toast } from "yosegi";
import { Case } from "../ui/case";

export function PopoverPage() {
  return (
    <>
      <Case
        title="Share"
        description="A title, a close button, a description, a field from its props and a footer. Focus moves inside; Escape returns it to the button."
      >
        <Popover
          trigger={{ label: "Share", icon: <ShareIcon /> }}
          title="Share note"
          description="Anyone with the link can read this note."
          field={{
            label: "Link",
            readOnly: true,
            defaultValue: "yosegi.app/n/8f2c",
          }}
          footer={<Button label="Copy link" size="sm" onClick={() => toast.success("Link copied")} />}
          placement="bottom-start"
        />
      </Case>

      <Case
        title="Filter"
        description="A narrower panel (--yosegi-popover-width: 240px) with checkboxes. Text as the trigger is an outline Button."
      >
        <Popover
          trigger="Filter"
          title="Show notes"
          placement="bottom-start"
          style={{ "--yosegi-popover-width": "240px" }}
        >
          <div style={{ display: "grid", gap: "10px" }}>
            <For
              each={
                [
                  ["Pinned", true],
                  ["With dates", true],
                  ["Archived", false],
                ] as const
              }
            >
              {([label, checked]) => <Checkbox label={label} defaultChecked={checked} />}
            </For>
          </div>
        </Popover>
      </Case>

      <Case
        title="Placements"
        description="placement picks the side; it flips when there's no room. closeButton={false} leaves just the text."
      >
        <For each={["top", "right", "bottom", "left"] as PopoverProps["placement"][]}>
          {(placement) => (
            <Popover
              trigger={{ label: placement, variant: "ghost" }}
              description={`Opens on the ${placement}.`}
              closeButton={false}
              placement={placement}
              style={{ "--yosegi-popover-width": "200px" }}
            />
          )}
        </For>
      </Case>

      <Case
        title="Without the arrow"
        description="arrow={false}: the panel sits flush, still placed against the button."
      >
        <Popover
          trigger="Details"
          title="Reading list"
          description="12 notes, last edited today."
          arrow={false}
          placement="bottom-start"
        />
      </Case>

      <Case title="Modal" description="modal keeps focus inside until it's finished or closed.">
        <Popover
          modal
          trigger={{ label: "New folder", variant: "solid" }}
          title="New folder"
          field={{ label: "Name", placeholder: "e.g. Travel" }}
          footer={<Button label="Create" size="sm" onClick={() => toast.success("Folder created")} />}
          placement="bottom-start"
        />
      </Case>
    </>
  );
}
