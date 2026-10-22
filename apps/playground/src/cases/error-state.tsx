import { Button, ErrorState, WarningIcon } from "yosegi";
import { Case, Cases } from "../ui/case";

export function ErrorStatePage() {
  return (
    <Cases>
      <Case title="Whole page" description="A failed first load, with a reference people can quote." layout="fill">
        <ErrorState>
          <ErrorState.Icon>
            <WarningIcon />
          </ErrorState.Icon>
          <ErrorState.Title as="h2">Something went wrong</ErrorState.Title>
          <ErrorState.Description>We couldn't load your notes. Check your connection and try again.</ErrorState.Description>
          <ErrorState.Detail>Error 503 · ref 8f2c</ErrorState.Detail>
          <ErrorState.Actions>
            <Button>Try again</Button>
            <Button variant="ghost">Contact support</Button>
          </ErrorState.Actions>
        </ErrorState>
      </Case>
      <Case title="One section" description="Smaller padding and a small button, inside a part of the page." layout="fill">
        <ErrorState style={{ "--yosegi-error-state-padding": "var(--yosegi-space-800) var(--yosegi-space-400)" }}>
          <ErrorState.Icon>
            <WarningIcon />
          </ErrorState.Icon>
          <ErrorState.Title as="h3">Couldn't save</ErrorState.Title>
          <ErrorState.Description>Your changes are kept on this device. We'll retry when you're back online.</ErrorState.Description>
          <ErrorState.Actions>
            <Button variant="outline" size="sm">
              Retry now
            </Button>
          </ErrorState.Actions>
        </ErrorState>
      </Case>
    </Cases>
  );
}
