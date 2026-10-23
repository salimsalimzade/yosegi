import { Button, NotFound } from "yosegi";
import { Case, Cases } from "../ui/case";

export function NotFoundPage() {
  return (
    <Cases>
      <Case title="Page" description={`The router's catch-all route; titleAs="h2" here, h1 by default.`} layout="fill">
        <NotFound
          code="404"
          title="Page not found"
          titleAs="h2"
          description="The page you're looking for doesn't exist or has moved. Check the address, or start again from home."
          actions={
            <>
              <Button label="Go home" as="a" href="/" />
              <Button label="Go back" variant="outline" onClick={() => history.back()} />
            </>
          }
        />
      </Case>
      <Case
        title="One item"
        description="A single thing that's gone, inside a page: --yosegi-not-found-code-size and padding make it smaller."
        layout="fill"
      >
        <NotFound
          style={{
            "--yosegi-not-found-padding": "var(--yosegi-space-800) var(--yosegi-space-400)",
            "--yosegi-not-found-code-size": "48px",
          }}
          code="404"
          title="This note doesn't exist"
          titleAs="h3"
          description="It may have been deleted, or the link is wrong."
          actions={<Button label="All notes" variant="outline" />}
        />
      </Case>
    </Cases>
  );
}
