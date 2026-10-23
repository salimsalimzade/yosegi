import { Checkbox, Tabs } from "yosegi";
import { Case } from "../ui/case";

export function TabsPage() {
  return (
    <>
      <Case title="Horizontal, with counts" description="← → move between tabs and switch panels; the disabled one is skipped." layout="fill">
        <Tabs defaultValue="all">
          <Tabs.List aria-label="Notes">
            <Tabs.Trigger value="all">
              All <span class="yosegi-tabs-count">12</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="pinned">
              Pinned <span class="yosegi-tabs-count">3</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="archive">Archive</Tabs.Trigger>
            <Tabs.Trigger value="shared" disabled>
              Shared
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="all">12 notes, newest first. “Shared” is disabled until you invite someone.</Tabs.Content>
          <Tabs.Content value="pinned">3 pinned notes.</Tabs.Content>
          <Tabs.Content value="archive">Nothing archived yet.</Tabs.Content>
        </Tabs>
      </Case>

      <Case title="Vertical" description="For settings pages with a side list; ↑ ↓ move." layout="fill">
        <Tabs orientation="vertical" defaultValue="notifications">
          <Tabs.List aria-label="Settings">
            <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
            <Tabs.Trigger value="notifications">Notifications</Tabs.Trigger>
            <Tabs.Trigger value="billing" disabled>
              Billing
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="profile">Your name and photo.</Tabs.Content>
          <Tabs.Content value="notifications">
            <div style={{ display: "grid", gap: "12px", "max-width": "380px" }}>
              <Checkbox label="Weekly summary" description="Every Monday, one email." defaultChecked />
              <Checkbox label="Mentions" />
            </div>
          </Tabs.Content>
        </Tabs>
      </Case>

      <Case title="Manual activation" description='activationMode="manual": arrows move focus, Enter or Space switches.' layout="fill">
        <Tabs activationMode="manual" defaultValue="day">
          <Tabs.List aria-label="Range">
            <Tabs.Trigger value="day">Day</Tabs.Trigger>
            <Tabs.Trigger value="week">Week</Tabs.Trigger>
            <Tabs.Trigger value="month">Month</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="day">Today's notes.</Tabs.Content>
          <Tabs.Content value="week">This week's notes.</Tabs.Content>
          <Tabs.Content value="month">This month's notes.</Tabs.Content>
        </Tabs>
      </Case>
    </>
  );
}
