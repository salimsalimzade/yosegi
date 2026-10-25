import { types as t } from "storybook/internal/babel";
import { getPrettier } from "storybook/internal/common";
import type { CsfFile } from "storybook/internal/csf-tools";

type CsfEnricher = (csf: CsfFile, csfSource: CsfFile) => Promise<void>;

const arrow = /^const \w+ = \(\w*\) => ([\s\S]*?);?\s*$/;

/**
 * `const Story = () => <Checkbox … />;` becomes `<Checkbox … />`. A story with a body keeps it: its JSX
 * needs the signals. Either way Prettier lays it out, since the framework's printer keeps odd indents.
 */
async function unwrap(code: string) {
  const { format } = await getPrettier();
  const body = arrow.exec(code)?.[1].trim();
  const source = !body || body.startsWith("{") ? code : body.replace(/^\(([\s\S]*)\)$/, "$1");
  try {
    const formatted = await format(source, { filepath: "snippet.tsx" });
    return formatted.trim().replace(/^(<[\s\S]*>);$/, "$1");
  } catch {
    return code;
  }
}

/**
 * Runs after the framework's enricher, which writes each story's "Show code" into
 * parameters.docs.source.code, and shows the component itself instead of a story function.
 */
export const unwrapSnippets =
  (enrich?: CsfEnricher): CsfEnricher =>
  async (csf, csfSource) => {
    await enrich?.(csf, csfSource);
    const snippets: t.StringLiteral[] = [];
    t.traverseFast(csf._ast.program, (node) => {
      if (t.isObjectProperty(node) && t.isIdentifier(node.key, { name: "code" }) && t.isStringLiteral(node.value)) {
        snippets.push(node.value);
      }
    });
    await Promise.all(
      snippets.map(async (snippet) => {
        snippet.value = await unwrap(snippet.value);
      }),
    );
  };
