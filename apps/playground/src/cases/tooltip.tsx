import { For } from "solid-js";
import { CalendarIcon, InfoIcon, PlusIcon, Tooltip, type TooltipProps } from "yosegi";
import { Case } from "../ui/case";

export function TooltipPage() {
  return (
    <>
      <Case
        title="On hover and focus"
        description="Hover for 300ms, or Tab to a button: keyboard focus opens it right away. Escape closes it."
      >
        <For
          each={
            [
              ["Archive", "Move to the archive"],
              ["Share", "Copy a link"],
            ] as const
          }
        >
          {([label, tip]) => <Tooltip trigger={label} content={tip} />}
        </For>
      </Case>

      <Case
        title="Naming icon buttons"
        description="The tooltip adds a description; the button still has its own aria-label."
      >
        <For
          each={
            [
              ["New note", PlusIcon],
              ["Pick a date", CalendarIcon],
              ["Synced 2 min ago", InfoIcon],
            ] as const
          }
        >
          {([tip, Icon]) => <Tooltip trigger={{ icon: <Icon />, variant: "ghost", "aria-label": tip }} content={tip} />}
        </For>
      </Case>

      <Case title="Placements" description="Always open here, so each side is visible at once." layout="center">
        <div style={{ display: "flex", gap: "96px", padding: "48px 72px" }}>
          <For each={["top", "right", "bottom", "left"] as TooltipProps["placement"][]}>
            {(placement) => (
              <Tooltip open placement={placement} trigger={{ label: placement, size: "sm" }} content={placement} />
            )}
          </For>
        </div>
      </Case>

      <Case
        title="Instant, disabled and without the arrow"
        description="openDelay={0} opens at once; disabled never opens; arrow={false} leaves just the text."
      >
        <Tooltip openDelay={0} trigger="No delay" content="Right away" />
        <Tooltip disabled trigger="Disabled tooltip" content="Never shown" />
        <Tooltip openDelay={0} arrow={false} trigger="No arrow" content="Just the text" />
      </Case>
    </>
  );
}
