import { Button, ErrorState, WarningIcon } from "yosegi";
import { Case, Cases } from "../ui/case";

export function ErrorStatePage() {
  return (
    <Cases>
      <Case title="Whole page" description="A failed first load, with a reference people can quote." layout="fill">
        <ErrorState
          icon={<WarningIcon />}
          title="Something went wrong"
          description="We couldn't load your notes. Check your connection and try again."
          detail="Error 503 · ref 8f2c"
          actions={
            <>
              <Button label="Try again" />
              <Button label="Contact support" variant="ghost" />
            </>
          }
        />
      </Case>
      <Case
        title="One section"
        description='Smaller padding and a small button, inside a part of the page; titleAs="h3".'
        layout="fill"
      >
        <ErrorState
          style={{ "--yosegi-error-state-padding": "var(--yosegi-space-800) var(--yosegi-space-400)" }}
          icon={<WarningIcon />}
          title="Couldn't save"
          titleAs="h3"
          description="Your changes are kept on this device. We'll retry when you're back online."
          actions={<Button label="Retry now" variant="outline" size="sm" />}
        />
      </Case>
    </Cases>
  );
}
