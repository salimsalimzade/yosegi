/** An option of a Select or Combobox. */
export interface Option {
  value: string;
  label: string;
  /** Options with a group sit under its heading. */
  group?: string;
  disabled?: boolean;
}

/** Reads your own option objects. Each one defaults to the field of the same name, so { value, label } needs none. */
export interface OptionAccessors<T> {
  /** The option's id, as value and onChange carry it. */
  getOptionValue?: (option: T) => string;
  /** The text in the box, the row and the search. */
  getOptionLabel?: (option: T) => string;
  /** Options with a group sit under its heading. */
  getOptionGroup?: (option: T) => string | undefined;
  getOptionDisabled?: (option: T) => boolean;
}

/** An option as the list reads it, with the object it came from. */
export interface ResolvedOption<T = unknown> extends Option {
  item: T;
}

/** Your options as the list reads them, through the accessors. */
export function resolveOptions<T>(options: readonly T[], accessors: OptionAccessors<T>): ResolvedOption<T>[] {
  return options.map((item) => {
    const fields = item as Partial<Option>;
    const value = accessors.getOptionValue ? accessors.getOptionValue(item) : String(fields.value);
    return {
      value,
      label: accessors.getOptionLabel ? accessors.getOptionLabel(item) : (fields.label ?? value),
      group: accessors.getOptionGroup ? accessors.getOptionGroup(item) : fields.group,
      disabled: accessors.getOptionDisabled ? accessors.getOptionDisabled(item) : fields.disabled,
      item,
    };
  });
}

export interface OptionGroup<T extends { group?: string }> {
  /** The heading; undefined for options without a group. */
  name: string | undefined;
  options: T[];
}

/**
 * Splits options into runs under their group headings, in the order they
 * come. Options without a group form runs of their own, with no heading.
 */
export function groupOptions<T extends { group?: string }>(options: T[]): OptionGroup<T>[] {
  const groups: OptionGroup<T>[] = [];
  for (const option of options) {
    const last = groups[groups.length - 1];
    if (last && last.name === option.group) last.options.push(option);
    else groups.push({ name: option.group, options: [option] });
  }
  return groups;
}

/** An id-safe form of an option's value. */
export const optionKey = (value: string) => value.replace(/[^\w-]/g, "_");
