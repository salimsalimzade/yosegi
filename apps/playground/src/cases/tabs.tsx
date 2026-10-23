import { Checkbox, Tabs } from "yosegi";
import { Case } from "../ui/case";

export function TabsPage() {
  return (
    <>
      <Case
        title="Horizontal, with counts"
        description="← → move between tabs and switch panels; the disabled one is skipped. count adds the number after a label."
        layout="fill"
      >
        <Tabs
          aria-label="Notes"
          defaultValue="all"
          tabs={[
            {
              value: "all",
              label: "All",
              count: 12,
              content: "12 notes, newest first. “Shared” is disabled until you invite someone.",
            },
            { value: "pinned", label: "Pinned", count: 3, content: "3 pinned notes." },
            { value: "archive", label: "Archive", content: "Nothing archived yet." },
            { value: "shared", label: "Shared", disabled: true },
          ]}
        />
      </Case>

      <Case title="Vertical" description="For settings pages with a side list; ↑ ↓ move." layout="fill">
        <Tabs
          aria-label="Settings"
          orientation="vertical"
          defaultValue="notifications"
          tabs={[
            { value: "profile", label: "Profile", content: "Your name and photo." },
            {
              value: "notifications",
              label: "Notifications",
              content: (
                <div style={{ display: "grid", gap: "12px", "max-width": "380px" }}>
                  <Checkbox label="Weekly summary" description="Every Monday, one email." defaultChecked />
                  <Checkbox label="Mentions" />
                </div>
              ),
            },
            { value: "billing", label: "Billing", disabled: true },
          ]}
        />
      </Case>

      <Case
        title="Manual activation"
        description='activationMode="manual": arrows move focus, Enter or Space switches.'
        layout="fill"
      >
        <Tabs
          aria-label="Range"
          activationMode="manual"
          defaultValue="day"
          tabs={[
            { value: "day", label: "Day", content: "Today's notes." },
            { value: "week", label: "Week", content: "This week's notes." },
            { value: "month", label: "Month", content: "This month's notes." },
          ]}
        />
      </Case>
    </>
  );
}
