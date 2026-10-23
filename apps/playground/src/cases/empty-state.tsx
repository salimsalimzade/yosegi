import { Button, EmptyState, InboxIcon, PlusIcon, SearchOffIcon } from "yosegi";
import { Case, Cases } from "../ui/case";

export function EmptyStatePage() {
  return (
    <Cases>
      <Case title="First time" description="Nothing here yet, with the action that fills it." layout="fill">
        <EmptyState
          icon={<InboxIcon />}
          title="No notes yet"
          description="Notes you create show up here."
          actions={<Button label="New note" icon={<PlusIcon />} />}
        />
      </Case>
      <Case title="No results" description="Repeat the search, and offer to clear it." layout="fill">
        <EmptyState
          icon={<SearchOffIcon />}
          title="No results for “kyoto trip”"
          description="Try fewer words, or check the spelling."
          actions={<Button label="Clear search" variant="outline" />}
        />
      </Case>
      <Case title="Compact, no icon" description='Inside a section, with less padding; titleAs="h3".' layout="fill">
        <EmptyState
          style={{ "--yosegi-empty-state-padding": "var(--yosegi-space-600) 0" }}
          title="No comments"
          titleAs="h3"
          description="Be the first to say something."
        />
      </Case>
    </Cases>
  );
}
