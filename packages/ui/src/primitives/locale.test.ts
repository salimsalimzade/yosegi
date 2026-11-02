import { describe, expect, it } from "vitest";
import { defaultLocale, mergeLabels } from "./locale";

describe("defaultLocale", () => {
  it("is English", () => {
    expect(defaultLocale).toBe("en-US");
  });
});

describe("mergeLabels", () => {
  const defaults = { next: "Next", previous: "Previous", page: (page: number) => `Page ${page}` };

  it("lets later layers win, label by label", () => {
    const merged = mergeLabels(defaults, { next: "Weiter" }, { previous: "Zurück" });
    expect(merged).toMatchObject({ next: "Weiter", previous: "Zurück" });
  });

  it("keeps what came before for a missing or undefined label", () => {
    expect(mergeLabels(defaults, undefined, { next: undefined })).toMatchObject({ next: "Next" });
  });

  it("replaces functions whole", () => {
    const page = (n: number) => `Seite ${n}`;
    expect(mergeLabels(defaults, { page }).page).toBe(page);
  });

  it("merges a group of labels inside, like Table's filter", () => {
    const merged = mergeLabels(
      { filter: {}, rowsPerPage: "Rows per page" },
      { filter: { title: "Filter", close: "Schließen" } },
      { filter: { close: "Zu" } },
    );
    expect(merged).toEqual({ filter: { title: "Filter", close: "Zu" }, rowsPerPage: "Rows per page" });
  });

  it("doesn't change its layers", () => {
    const provider = { filter: { title: "Filter" } };
    mergeLabels({ filter: {} }, provider, { filter: { close: "Zu" } });
    expect(provider).toEqual({ filter: { title: "Filter" } });
  });
});
