import { useNavigate } from "@solidjs/router";
import { createMemo, createSignal, For, onCleanup, onSettled, Show } from "solid-js";
import {
  ArchiveIcon,
  Button,
  ButtonGroup,
  Command,
  type CommandAction,
  Dialog,
  DownloadIcon,
  GridIcon,
  InboxIcon,
  InfoIcon,
  Item,
  KbdGroup,
  SearchIcon,
  Separator,
  ShareIcon,
  Table,
  type TableColumn,
  Tabs,
  TickIcon,
  Toaster,
  Tooltip,
  toast,
  WarningIcon,
} from "yosegi-solid";
import { type Bar, BarChart } from "../components/bar-chart";
import { ExampleBar } from "../components/example-bar";
import { SiteHeader } from "../components/site-header";
import {
  activity,
  channelLabels,
  compactMoney,
  daysAgo,
  money,
  type Order,
  orders,
  ordersOn,
  products,
  type Range,
  ranges,
  refundsOn,
  revenueOn,
  shortDate,
  statusLabels,
} from "../data/shop";
import { toggleTheme } from "../theme";
import styles from "./dashboard.module.scss";

const sum = (days: number, from: number, per: (day: number) => number) =>
  Array.from({ length: days }, (_, i) => per(from + i)).reduce((a, b) => a + b, 0);

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

/** Initials in a circle, then the name. */
function Customer(props: { name: string }) {
  return (
    <span class={styles.customer}>
      <span class={styles.avatar} aria-hidden="true">
        {initials(props.name)}
      </span>
      {props.name}
    </span>
  );
}

const statusIcons = { shipped: TickIcon, paid: TickIcon, pending: InfoIcon, refunded: WarningIcon };

/** An icon in the status's colour, then its label: never the colour alone. */
function Status(props: { status: Order["status"]; label: string }) {
  const Icon = statusIcons[props.status];
  return (
    <span class={styles.status} data-status={props.status}>
      <Icon />
      {props.label}
    </span>
  );
}

const columns: TableColumn<Order>[] = [
  { key: "id", label: "Order", sortable: true, width: 96 },
  { key: "customer", label: "Customer", sortable: true, cell: (order) => <Customer name={order.customer} /> },
  {
    key: "status",
    label: "Status",
    filter: true,
    options: statusLabels,
    cell: (order, text) => <Status status={order.status} label={text} />,
  },
  { key: "channel", label: "Channel", filter: true, options: channelLabels },
  { key: "date", label: "Date", sortable: true, searchable: false, format: (date: Date) => shortDate.format(date) },
  {
    key: "amount",
    label: "Amount",
    align: "end",
    sortable: true,
    filter: "range",
    format: (amount: number) => money.format(amount),
  },
];

/** A tea shop's overview: figures for a range, a chart, what just happened, and every recent order. */
export function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = createSignal<Range>("30d");
  const [view, setView] = createSignal<"chart" | "table">("chart");
  const [sideTab, setSideTab] = createSignal("activity");
  const [paletteOpen, setPaletteOpen] = createSignal(false);
  const [exporting, setExporting] = createSignal(false);
  // The order open in the dialog, and the statuses people have changed here.
  const [openedId, setOpenedId] = createSignal<string>();
  const [changed, setChanged] = createSignal<Record<string, Order["status"]>>({});
  const [selected, setSelected] = createSignal<string[]>([]);

  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (run: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      run();
    }, ms);
    timers.add(timer);
  };
  onCleanup(() => timers.forEach(clearTimeout));

  const days = () => ranges.find((r) => r.value === range())!.days;
  const rangeLabel = () => ranges.find((r) => r.value === range())!.label;

  // ------------------------------------------------------------- Figures

  // This range, and the one just before it, to compare against.
  const figures = createMemo(() => {
    const d = days();
    const revenue = [sum(d, 0, revenueOn), sum(d, d, revenueOn)];
    const count = [sum(d, 0, ordersOn), sum(d, d, ordersOn)];
    const refunds = [sum(d, 0, refundsOn), sum(d, d, refundsOn)];
    return [
      { label: "Revenue", value: compactMoney.format(revenue[0]), now: revenue[0], before: revenue[1], upIsGood: true },
      { label: "Orders", value: count[0].toLocaleString("en"), now: count[0], before: count[1], upIsGood: true },
      {
        label: "Average order",
        value: money.format(revenue[0] / count[0]),
        now: revenue[0] / count[0],
        before: revenue[1] / count[1],
        upIsGood: true,
      },
      { label: "Refunds", value: String(refunds[0]), now: refunds[0], before: refunds[1], upIsGood: false },
    ];
  });

  const change = (now: number, before: number) => (before ? (now - before) / before : 0);
  // The arrow says which way, so the number goes without a sign.
  const percent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 });

  // Days for a week or a month, weeks for 90 days, oldest on the left.
  const bars = createMemo<Bar[]>(() => {
    if (range() === "90d") {
      return Array.from({ length: 13 }, (_, i) => {
        const week = 12 - i;
        return { label: `Week of ${shortDate.format(daysAgo(week * 7 + 6))}`, value: sum(7, week * 7, revenueOn) };
      });
    }
    return Array.from({ length: days() }, (_, i) => {
      const day = days() - 1 - i;
      return { label: shortDate.format(daysAgo(day)), value: revenueOn(day) };
    });
  });

  // -------------------------------------------------------------- Orders

  const rows = createMemo(() =>
    orders.map((order) => (changed()[order.id] ? { ...order, status: changed()[order.id] } : order)),
  );

  const opened = () => rows().find((order) => order.id === openedId());
  const close = () => setOpenedId(undefined);

  const setStatus = (ids: string[], status: Order["status"]) =>
    setChanged((c) => ({ ...c, ...Object.fromEntries(ids.map((id) => [id, status])) }));

  const ship = (list: Order[]) => {
    const ready = list.filter((order) => order.status === "paid" || order.status === "pending");
    if (!ready.length) {
      toast("Those orders have already gone out");
      return;
    }
    setStatus(
      ready.map((order) => order.id),
      "shipped",
    );
    setSelected([]);
    toast.success(
      ready.length === 1 ? `${ready[0].id} marked as shipped` : `${ready.length} orders marked as shipped`,
      {
        action: { label: "Undo", onClick: () => ready.forEach((order) => setStatus([order.id], order.status)) },
      },
    );
  };

  const refund = (order: Order) => {
    setStatus([order.id], "refunded");
    close();
    toast.success(`${money.format(order.amount)} refunded to ${order.customer.split(" ")[0]}`);
  };

  const exportOrders = () => {
    setExporting(true);
    const id = toast.loading("Exporting 240 orders…");
    later(() => {
      setExporting(false);
      toast.success("orders.csv is ready", { id, description: "We've also emailed you a copy." });
    }, 1400);
  };

  const showOrders = () => document.getElementById("orders")?.scrollIntoView({ behavior: "smooth" });
  const showProducts = () => {
    setSideTab("products");
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  // ------------------------------------------------------------- Palette

  const commands = (): CommandAction[] => [
    { value: "Orders", icon: <InboxIcon />, group: "Go to", onSelect: showOrders },
    { value: "All examples", icon: <GridIcon />, group: "Go to", onSelect: () => navigate("/examples") },
    ...ranges.map((r) => ({
      value: `Show the last ${r.label}`,
      group: "Range",
      keywords: ["range", "period"],
      onSelect: () => setRange(r.value),
    })),
    { value: "Export orders", icon: <DownloadIcon />, group: "Actions", keywords: ["csv"], onSelect: exportOrders },
    {
      value: "Copy a link to this page",
      icon: <ShareIcon />,
      group: "Actions",
      onSelect: () => toast.success("Link copied"),
    },
    { value: "Switch theme", group: "Actions", keywords: ["dark", "light"], onSelect: () => toggleTheme() },
  ];

  // ⌘K or Ctrl+K opens the palette from anywhere on the page.
  onSettled(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div class={styles.root}>
      <SiteHeader />
      <ExampleBar title="Dashboard" file="dashboard.tsx" />

      <div class={styles.app}>
        <aside class={styles.sidebar}>
          <div class={styles.shop}>
            <span class={styles.logo} aria-hidden="true">
              K
            </span>
            <div>
              <div class={styles["shop-name"]}>Kissa Tea</div>
              <div class={styles.muted}>Store</div>
            </div>
          </div>
          <nav class={styles.nav} aria-label="Store">
            <Item as="a" href="/examples/dashboard" size="sm" media={<GridIcon />} title="Overview" selected />
            {/* Buttons, not links: they scroll this page, which the router would mark as current. */}
            <Item as="button" size="sm" media={<InboxIcon />} title="Orders" onClick={showOrders} />
            <Item as="button" size="sm" media={<ArchiveIcon />} title="Products" onClick={showProducts} />
          </nav>
          <Separator class={styles.rule} />
          <Item class={styles.me} size="sm" media="EC" mediaVariant="avatar" title="Emma Clarke" description="Owner" />
        </aside>

        <main class={styles.main}>
          {/* The padding lives inside the scrolling area, so the last card always clears the bottom. */}
          <div class={styles.content}>
            <header class={styles.top}>
              <div class={styles.heading}>
                <h1>Overview</h1>
                <p class={styles.muted}>How the shop did in the last {rangeLabel()}.</p>
              </div>
              <div class={styles.tools}>
                <Button
                  variant="outline"
                  icon={<SearchIcon />}
                  label={
                    <>
                      Search <KbdGroup keys={[{ key: "⌘", label: "Command" }, "K"]} />
                    </>
                  }
                  onClick={() => setPaletteOpen(true)}
                />
                <ButtonGroup attached aria-label="Range">
                  <For each={ranges}>
                    {(r) => (
                      <Button
                        variant="outline"
                        label={r.label}
                        aria-pressed={range() === r.value}
                        onClick={() => setRange(r.value)}
                      />
                    )}
                  </For>
                </ButtonGroup>
              </div>
            </header>

            <section class={styles.figures} aria-label="Figures">
              <For each={figures()}>
                {(figure) => {
                  const delta = () => change(figure.now, figure.before);
                  const good = () => delta() >= 0 === figure.upIsGood;
                  return (
                    <div class={styles.card}>
                      <span class={styles.label}>{figure.label}</span>
                      <span class={styles.value}>{figure.value}</span>
                      <span class={styles.delta}>
                        <span data-good={delta() === 0 ? undefined : good() ? "true" : "false"}>
                          {delta() > 0 ? "↑" : delta() < 0 ? "↓" : ""} {percent.format(Math.abs(delta()))}
                        </span>{" "}
                        vs the {rangeLabel()} before
                      </span>
                    </div>
                  );
                }}
              </For>
            </section>

            <section class={styles.middle}>
              <div class={[styles.card, styles.chart]}>
                <div class={styles["card-head"]}>
                  <div>
                    <h2 class={styles.title}>Revenue</h2>
                    <p class={styles.muted}>{range() === "90d" ? "By week" : "By day"}, every channel together.</p>
                  </div>
                  <ButtonGroup attached aria-label="Show revenue as">
                    <Button
                      size="sm"
                      variant="outline"
                      label="Chart"
                      aria-pressed={view() === "chart"}
                      onClick={() => setView("chart")}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      label="Table"
                      aria-pressed={view() === "table"}
                      onClick={() => setView("table")}
                    />
                  </ButtonGroup>
                </div>
                <Show
                  when={view() === "chart"}
                  fallback={
                    <div class={styles["chart-table"]}>
                      <Table>
                        <Table.Header>
                          <Table.Row>
                            <Table.Head>{range() === "90d" ? "Week" : "Day"}</Table.Head>
                            <Table.Head align="end">Revenue</Table.Head>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          <For each={[...bars()].reverse()}>
                            {(bar) => (
                              <Table.Row>
                                <Table.Cell>{bar.label}</Table.Cell>
                                <Table.Cell align="end">{money.format(bar.value)}</Table.Cell>
                              </Table.Row>
                            )}
                          </For>
                        </Table.Body>
                      </Table>
                    </div>
                  }
                >
                  <div class={styles.plot}>
                    <BarChart
                      bars={bars()}
                      format={(value) => compactMoney.format(value)}
                      label={`Revenue over the last ${rangeLabel()}, ${figures()[0].value} in all.`}
                    />
                  </div>
                </Show>
              </div>

              <div class={[styles.card, styles.side]} id="products">
                <Tabs
                  aria-label="What's happening"
                  class={styles.tabs}
                  value={sideTab()}
                  onChange={setSideTab}
                  tabs={[
                    {
                      value: "activity",
                      label: "Activity",
                      content: (
                        <div class={styles.list}>
                          <For each={activity}>
                            {(entry) => (
                              <Item
                                size="sm"
                                media={entry.initials}
                                mediaVariant="avatar"
                                title={entry.name}
                                description={entry.text}
                                actions={<span class={styles.when}>{entry.when}</span>}
                              />
                            )}
                          </For>
                        </div>
                      ),
                    },
                    {
                      value: "products",
                      label: "Top products",
                      content: (
                        <div class={styles.list}>
                          <For each={products}>
                            {(product, i) => (
                              <Item
                                size="sm"
                                media={String(i() + 1)}
                                mediaVariant="avatar"
                                title={product.name}
                                description={`${product.sold} sold`}
                                actions={<span class={styles.amount}>{money.format(product.revenue)}</span>}
                              />
                            )}
                          </For>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </section>

            <section id="orders" class={styles.orders} aria-label="Orders">
              <Table
                title="Recent orders"
                description="The latest 240, from the shop, online and wholesale. Click one to open it."
                noun="orders"
                data={rows()}
                columns={columns}
                // Ten rows and the headings fit; more rows per page scroll inside, so the box never grows.
                height={480}
                selectable
                selected={selected()}
                onSelectedChange={setSelected}
                defaultQuery={{ sort: { key: "date", direction: "desc" } }}
                onRowClick={(order) => setOpenedId(order.id)}
                actions={
                  <Tooltip
                    trigger={{
                      icon: <DownloadIcon />,
                      variant: "outline",
                      "aria-label": "Export orders",
                      loading: exporting(),
                      onClick: exportOrders,
                    }}
                    content="Export as CSV"
                  />
                }
                selectionActions={(selection) => (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<TickIcon />}
                    label="Mark as shipped"
                    onClick={() => ship(selection.rows)}
                  />
                )}
              />
            </section>
          </div>
        </main>
      </div>

      <Command.Dialog
        open={paletteOpen()}
        onOpenChange={setPaletteOpen}
        items={commands()}
        placeholder="Search pages and actions…"
        onSelect={() => setPaletteOpen(false)}
      />

      <Dialog
        open={!!opened()}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        title={`Order ${opened()?.id ?? ""}`}
        description={opened() && `${opened()!.customer} · ${shortDate.format(opened()!.date)}`}
        footer={
          <Show when={opened()}>
            {(order) => (
              <>
                <Show when={order().status !== "refunded"}>
                  <Button label="Refund" variant="ghost" onClick={() => refund(order())} />
                </Show>
                <Show when={order().status === "paid" || order().status === "pending"}>
                  <Button
                    label="Mark as shipped"
                    variant="outline"
                    onClick={() => {
                      ship([order()]);
                      close();
                    }}
                  />
                </Show>
                <Button label="Done" onClick={close} />
              </>
            )}
          </Show>
        }
      >
        <Show when={opened()}>
          {(order) => (
            <dl class={styles.details}>
              <div>
                <dt>Status</dt>
                <dd>
                  <Status status={order().status} label={statusLabels[order().status]} />
                </dd>
              </div>
              <div>
                <dt>Channel</dt>
                <dd>{channelLabels[order().channel]}</dd>
              </div>
              <div>
                <dt>Items</dt>
                <dd>{order().items}</dd>
              </div>
              <div class={styles.total}>
                <dt>Total</dt>
                <dd>{money.format(order().amount)}</dd>
              </div>
            </dl>
          )}
        </Show>
      </Dialog>

      <Toaster aria-label="Notifications" position="top-right" />
    </div>
  );
}
