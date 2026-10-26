import { createMemo, createSignal, For, Show } from "solid-js";
import styles from "./bar-chart.module.scss";

export interface Bar {
  /** What the bar is, like “12 Oct”: under the chart and in its tooltip. */
  label: string;
  value: number;
}

/** 1, 2, 2.5 or 5 times a power of ten, at least `x`: clean steps for the axis. */
function niceStep(x: number) {
  const power = 10 ** Math.floor(Math.log10(x || 1));
  const f = x / power;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * power;
}

/**
 * One series as columns, in the accent: three clean gridlines, the first, middle and last labels
 * under it, and a tooltip on the bar under the pointer.
 */
export function BarChart(props: {
  bars: Bar[];
  /** The values as text, on the axis and in the tooltip. */
  format: (value: number) => string;
  /** What the chart shows, for screen readers. */
  label: string;
}) {
  const [hovered, setHovered] = createSignal<number>();

  const step = createMemo(() => niceStep(Math.max(...props.bars.map((bar) => bar.value)) / 3));
  const top = () => step() * 3;
  const ticks = () => [0, 1, 2, 3].map((i) => i * step());
  const edges = () => {
    const last = props.bars.length - 1;
    return [0, Math.floor(last / 2), last];
  };

  return (
    <div class={styles.root} role="img" aria-label={props.label}>
      <div class={styles.axis} aria-hidden="true">
        <For each={ticks()}>
          {(tick) => (
            <span class={styles.tick} style={{ bottom: `${(tick / top()) * 100}%` }}>
              {props.format(tick)}
            </span>
          )}
        </For>
      </div>

      <div class={styles.plot} data-hovering={hovered() !== undefined ? "" : undefined}>
        <For each={ticks()}>
          {(tick) => <span class={styles.grid} style={{ bottom: `${(tick / top()) * 100}%` }} />}
        </For>
        <div class={styles.bars} onPointerLeave={() => setHovered(undefined)}>
          <For each={props.bars}>
            {(bar, i) => (
              <div
                class={styles.column}
                data-hovered={hovered() === i() ? "" : undefined}
                onPointerEnter={() => setHovered(i())}
              >
                <span class={styles.fill} style={{ height: `${(bar.value / top()) * 100}%` }} />
              </div>
            )}
          </For>
        </div>

        <Show when={hovered() !== undefined && props.bars[hovered()!]}>
          {(bar) => (
            <div
              class={styles.tooltip}
              data-side={hovered()! > props.bars.length / 2 ? "start" : "end"}
              style={{
                left: `${((hovered()! + 0.5) / props.bars.length) * 100}%`,
                bottom: `${(bar().value / top()) * 100}%`,
              }}
            >
              <span class={styles["tooltip-label"]}>{bar().label}</span>
              <span class={styles["tooltip-value"]}>{props.format(bar().value)}</span>
            </div>
          )}
        </Show>
      </div>

      <div class={styles.labels} aria-hidden="true">
        <For each={edges()}>
          {(index) => (
            <span
              class={styles.label}
              // The first and last labels line up with the plot's edges; the middle one centres on its bar.
              style={
                index === 0
                  ? { left: "0" }
                  : index === props.bars.length - 1
                    ? { right: "0" }
                    : { left: `${((index + 0.5) / props.bars.length) * 100}%`, translate: "-50% 0" }
              }
            >
              {props.bars[index]?.label}
            </span>
          )}
        </For>
      </div>
    </div>
  );
}
