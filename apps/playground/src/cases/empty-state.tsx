import { Button, EmptyState, InboxIcon, PlusIcon, SearchOffIcon } from "yosegi";
import { Case, Cases } from "../ui/case";

export function EmptyStatePage() {
  return (
    <Cases>
      <Case title="First time" description="Nothing here yet, with the action that fills it." layout="fill">
        <EmptyState>
          <EmptyState.Icon>
            <InboxIcon />
          </EmptyState.Icon>
          <EmptyState.Title>No notes yet</EmptyState.Title>
          <EmptyState.Description>Notes you create show up here.</EmptyState.Description>
          <EmptyState.Actions>
            <Button label="New note" icon={<PlusIcon />} />
          </EmptyState.Actions>
        </EmptyState>
      </Case>
      <Case title="No results" description="Repeat the search, and offer to clear it." layout="fill">
        <EmptyState>
          <EmptyState.Icon>
            <SearchOffIcon />
          </EmptyState.Icon>
          <EmptyState.Title>No results for “kyoto trip”</EmptyState.Title>
          <EmptyState.Description>Try fewer words, or check the spelling.</EmptyState.Description>
          <EmptyState.Actions>
            <Button label="Clear search" variant="outline" />
          </EmptyState.Actions>
        </EmptyState>
      </Case>
      <Case title="Compact, no icon" description="Inside a section, with less padding." layout="fill">
        <EmptyState style={{ "--yosegi-empty-state-padding": "var(--yosegi-space-600) 0" }}>
          <EmptyState.Title as="h3">No comments</EmptyState.Title>
          <EmptyState.Description>Be the first to say something.</EmptyState.Description>
        </EmptyState>
      </Case>
    </Cases>
  );
}
