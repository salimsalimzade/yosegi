import { Button, NotFound } from "yosegi";
import { Case, Cases } from "../ui/case";

export function NotFoundPage() {
  return (
    <Cases>
      <Case title="Page" description="The router's catch-all route." layout="fill">
        <NotFound>
          <NotFound.Code>404</NotFound.Code>
          <NotFound.Title as="h2">Page not found</NotFound.Title>
          <NotFound.Description>
            The page you're looking for doesn't exist or has moved. Check the address, or start again from home.
          </NotFound.Description>
          <NotFound.Actions>
            <Button label="Go home" as="a" href="/" />
            <Button label="Go back" variant="outline" onClick={() => history.back()} />
          </NotFound.Actions>
        </NotFound>
      </Case>
      <Case
        title="One item"
        description="A single thing that's gone, inside a page: smaller code and padding."
        layout="fill"
      >
        <NotFound style={{ "--yosegi-not-found-padding": "var(--yosegi-space-800) var(--yosegi-space-400)" }}>
          <NotFound.Code style={{ "font-size": "48px" }}>404</NotFound.Code>
          <NotFound.Title as="h3">This note doesn't exist</NotFound.Title>
          <NotFound.Description>It may have been deleted, or the link is wrong.</NotFound.Description>
          <NotFound.Actions>
            <Button label="All notes" variant="outline" />
          </NotFound.Actions>
        </NotFound>
      </Case>
    </Cases>
  );
}
