import { createSignal, untrack } from "solid-js";

export interface ControllableSignalOptions<T> {
  /** The controlled value; `undefined` means the component owns the state. */
  value: () => T | undefined;
  /** The starting value when uncontrolled. Read once. */
  defaultValue: () => T;
  onChange?: (value: T) => void;
  equals?: (a: T, b: T) => boolean;
}

/**
 * State that is controlled when the parent passes a value and uncontrolled
 * otherwise, like a native input with `value` or `defaultValue`. The setter
 * calls `onChange` either way, and skips values equal to the current one.
 */
export function createControllableSignal<T>(options: ControllableSignalOptions<T>) {
  const [internal, setInternal] = createSignal<T>(untrack(options.defaultValue) as Exclude<T, Function>);
  const equals = options.equals ?? Object.is;

  const isControlled = () => options.value() !== undefined;
  const value = () => (isControlled() ? (options.value() as T) : internal());

  const setValue = (next: T) => {
    if (equals(next, untrack(value))) return;
    if (!untrack(isControlled)) setInternal(() => next as Exclude<T, Function>);
    options.onChange?.(next);
  };

  return [value, setValue] as const;
}
