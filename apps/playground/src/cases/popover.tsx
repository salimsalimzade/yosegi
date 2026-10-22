import { For } from "solid-js";
import { Button, Checkbox, Popover, type PopoverProps, ShareIcon, TextField, toast } from "yosegi";
import { Case } from "../ui/case";

export function PopoverPage() {
  return (
    <>
      <Case title="Share" description="A title, a close button, a description and a small task. Focus moves inside; Escape returns it to the button.">
        <Popover placement="bottom-start">
          <Popover.Trigger as={Button} variant="outline" icon={<ShareIcon />}>
            Share
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content>
              <Popover.Arrow />
              <div class="yosegi-popover-header">
                <Popover.Title>Share note</Popover.Title>
                <Popover.CloseButton />
              </div>
              <Popover.Description>Anyone with the link can read this note.</Popover.Description>
              <TextField readOnly defaultValue="yosegi.app/n/8f2c">
                <TextField.Label>Link</TextField.Label>
                <TextField.Input />
              </TextField>
              <div style={{ display: "flex", "justify-content": "flex-end" }}>
                <Button size="sm" onClick={() => toast.success("Link copied")}>
                  Copy link
                </Button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      </Case>

      <Case title="Filter" description="A narrower panel (--yosegi-popover-width: 240px) with checkboxes.">
        <Popover placement="bottom-start">
          <Popover.Trigger as={Button} variant="outline">
            Filter
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content style={{ "--yosegi-popover-width": "240px" }}>
              <Popover.Arrow />
              <div class="yosegi-popover-header">
                <Popover.Title>Show notes</Popover.Title>
                <Popover.CloseButton />
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                <For each={[["Pinned", true], ["With dates", true], ["Archived", false]] as const}>
                  {([label, checked]) => (
                    <Checkbox defaultChecked={checked}>
                      <Checkbox.Input />
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Label>{label}</Checkbox.Label>
                    </Checkbox>
                  )}
                </For>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      </Case>

      <Case title="Placements" description="placement picks the side; it flips when there's no room.">
        <For each={["top", "right", "bottom", "left"] as PopoverProps["placement"][]}>
          {(placement) => (
            <Popover placement={placement}>
              <Popover.Trigger as={Button} variant="ghost">
                {placement}
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content style={{ "--yosegi-popover-width": "200px" }}>
                  <Popover.Arrow />
                  <Popover.Description>Opens on the {placement}.</Popover.Description>
                </Popover.Content>
              </Popover.Portal>
            </Popover>
          )}
        </For>
      </Case>

      <Case title="Modal" description="modal keeps focus inside until it's finished or closed.">
        <Popover modal placement="bottom-start">
          <Popover.Trigger as={Button}>New folder</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content>
              <Popover.Arrow />
              <div class="yosegi-popover-header">
                <Popover.Title>New folder</Popover.Title>
                <Popover.CloseButton />
              </div>
              <TextField>
                <TextField.Label>Name</TextField.Label>
                <TextField.Input placeholder="e.g. Travel" />
              </TextField>
              <div style={{ display: "flex", "justify-content": "flex-end", gap: "8px" }}>
                <Button size="sm" onClick={() => toast.success("Folder created")}>
                  Create
                </Button>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover>
      </Case>
    </>
  );
}
