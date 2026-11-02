import { describe, expect, it } from "vitest";
import { groupOptions, optionKey, resolveOptions } from "./option-groups";

describe("resolveOptions", () => {
  it("reads { value, label, group, disabled } as they are", () => {
    const [option] = resolveOptions([{ value: "paid", label: "Paid", group: "Done", disabled: true }], {});
    expect(option).toMatchObject({ value: "paid", label: "Paid", group: "Done", disabled: true });
  });

  it("uses the value as the label when there's none", () => {
    expect(resolveOptions([{ value: "paid" }], {})[0].label).toBe("paid");
  });

  it("reads your own objects through the accessors and keeps them as item", () => {
    const plan = { code: "team", title: "Team", retired: true };
    const [option] = resolveOptions([plan], {
      getOptionValue: (p) => p.code,
      getOptionLabel: (p) => p.title,
      getOptionDisabled: (p) => p.retired,
    });
    expect(option).toMatchObject({ value: "team", label: "Team", disabled: true });
    expect(option.item).toBe(plan);
  });
});

describe("groupOptions", () => {
  it("puts runs under their headings, in order", () => {
    const groups = groupOptions([
      { value: "a", group: "One" },
      { value: "b", group: "One" },
      { value: "c", group: "Two" },
    ]);
    expect(groups.map((g) => [g.name, g.options.map((o) => o.value)])).toEqual([
      ["One", ["a", "b"]],
      ["Two", ["c"]],
    ]);
  });

  it("starts a new run when a group comes back later", () => {
    const groups = groupOptions([{ group: "One" }, { group: undefined }, { group: "One" }]);
    expect(groups.map((g) => g.name)).toEqual(["One", undefined, "One"]);
  });

  it("is empty for no options", () => {
    expect(groupOptions([])).toEqual([]);
  });
});

describe("optionKey", () => {
  it("makes a value safe for an id", () => {
    expect(optionKey("new york, ny")).toBe("new_york__ny");
    expect(optionKey("in-review_2")).toBe("in-review_2");
  });
});
