import { createSignal } from "solid-js";

/** A pretend request: true for a while after it starts. */
export function createTask(ms = 1500) {
  const [busy, setBusy] = createSignal(false);
  const run = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), ms);
  };
  return [busy, run] as const;
}
