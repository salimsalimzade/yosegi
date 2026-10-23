import type { JSX } from "@solidjs/web";
import {
  children,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  omit,
  onCleanup,
  Show,
  untrack,
} from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createPart } from "../../primitives/create-part";
import { dataAttr, mergeStyle } from "../../primitives/dom";
import { ChevronDownIcon, SearchIcon } from "../../primitives/icons";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { Select } from "../select/select";
import { Spinner } from "../spinner/spinner";
import { TextField } from "../text-field/text-field";
import { Filter, type FilterValue } from "./filter";
import { Pagination } from "./pagination";
import {
  columnText,
  countValues,
  filterKind,
  filterOptions,
  pageOffset,
  rowMatches,
  sortRows,
  type TableColumn,
  type TableQuery,
} from "./table-model";
import styles from "./table.module.scss";

/** A plain table: the parts below, put together by hand. */
function PlainTable(props: JSX.HTMLAttributes<HTMLTableElement>) {
  const rest = omit(props, "class", "children");

  return (
    <div class={[styles.root, "yosegi-table-container"]}>
      <table {...rest} class={[styles.table, "yosegi-table", props.class]}>
        {props.children}
      </table>
    </div>
  );
}

export interface TableRowProps extends JSX.HTMLAttributes<HTMLTableRowElement> {
  /** The muted fill and an accent edge on the start side. */
  selected?: boolean;
}

function Row(props: TableRowProps) {
  const rest = omit(props, "selected", "class", "children");

  return (
    <tr {...rest} class={[styles.row, "yosegi-table-row", props.class]} data-selected={dataAttr(props.selected)}>
      {props.children}
    </tr>
  );
}

interface CellOptions {
  /** start (default), center, or end for numbers. */
  align?: "start" | "center" | "end";
  /** A 32px column for the row's Checkbox. */
  selection?: boolean;
}

export interface TableHeadProps extends Omit<JSX.ThHTMLAttributes<HTMLTableCellElement>, "align">, CellOptions {}
export interface TableCellProps extends Omit<JSX.TdHTMLAttributes<HTMLTableCellElement>, "align">, CellOptions {}

/** A column heading (th scope="col"). */
function Head(props: TableHeadProps) {
  const rest = omit(props, "align", "selection", "class", "children");
  return (
    <th
      scope="col"
      {...rest}
      class={[styles.head, "yosegi-table-head", props.class]}
      data-align={props.align}
      data-selection={dataAttr(props.selection)}
    >
      {props.children}
    </th>
  );
}

function Cell(props: TableCellProps) {
  const rest = omit(props, "align", "selection", "class", "children");
  return (
    <td
      {...rest}
      class={[styles.cell, "yosegi-table-cell", props.class]}
      data-align={props.align}
      data-selection={dataAttr(props.selection)}
    >
      {props.children}
    </td>
  );
}

export interface TableEmptyProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
  /** How many columns the message spans: all of them. */
  colspan: number;
}

/** A full-width row for “nothing here” or “no matches”, with an action. */
function Empty(props: TableEmptyProps) {
  const rest = omit(props, "class", "children");
  return (
    <tr class={[styles.row, styles["empty-row"]]}>
      <td {...rest} class={[styles.cell, props.class]}>
        <div class={[styles.empty, "yosegi-table-empty"]}>{props.children}</div>
      </td>
    </tr>
  );
}

export interface TableRangeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  from: number;
  to: number;
  total: number;
}

const count = new Intl.NumberFormat();

/** “21–40 of 312”, or “0 of 312” when there are no rows. */
function Range(props: TableRangeProps) {
  const rest = omit(props, "from", "to", "total", "class", "children");
  const text = () =>
    props.to < props.from || props.to === 0
      ? `0 of ${count.format(props.total)}`
      : `${count.format(props.from)}–${count.format(props.to)} of ${count.format(props.total)}`;
  return (
    <span {...rest} class={[styles.range, "yosegi-table-range", props.class]}>
      {text()}
    </span>
  );
}

const Box = createPart("div", styles.box, "yosegi-table-box");
const TopBar = createPart("div", styles["top-bar"], "yosegi-table-top-bar");
const Title = createPart<HTMLHeadingElement>("h2", styles.title, "yosegi-table-title");
const Description = createPart<HTMLParagraphElement>("p", styles.description, "yosegi-table-description");
const Actions = createPart("div", styles.actions, "yosegi-table-actions");
const Toolbar = createPart("div", styles.toolbar, "yosegi-table-toolbar");
const SelectionBar = createPart("div", styles["selection-bar"], "yosegi-table-selection-bar", { role: "status" });
const Header = createPart<HTMLTableSectionElement>("thead", styles.header, "yosegi-table-header");
const Body = createPart<HTMLTableSectionElement>("tbody", styles.body, "yosegi-table-body");
/** Rows per page and the range on the left, Pagination on the right. */
function BottomBar(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, "class", "children");
  const resolved = children(() => props.children);
  const isPagination = (node: unknown) => node instanceof Element && node.classList.contains("yosegi-pagination");
  return (
    <div {...rest} class={[styles["bottom-bar"], "yosegi-table-bottom-bar", props.class]}>
      <div class={[styles["bottom-bar-start"], "yosegi-table-bottom-bar-start"]}>
        {resolved.toArray().filter((node) => !isPagination(node))}
      </div>
      {resolved.toArray().filter(isPagination)}
    </div>
  );
}

export interface TablePageSizeProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: number;
  /** 10 by default. */
  defaultValue?: number;
  onChange?: (size: number) => void;
  /** [10, 20, 50, 100] by default. */
  options?: number[];
}

/** “Rows per page” and a small Select. Changing it changes the page count. */
function PageSize(props: TablePageSizeProps) {
  const rest = omit(props, "value", "defaultValue", "onChange", "options", "class", "children");
  const [size, setSize] = createControllableSignal({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? 10,
    onChange: (next) => props.onChange?.(next),
  });
  // The current size is always a choice, even when it isn't one of the options.
  const options = () =>
    [...new Set([...(props.options ?? [10, 20, 50, 100]), size()])]
      .sort((a, b) => a - b)
      .map((value) => ({ value: String(value), label: String(value) }));

  return (
    <div {...rest} class={[styles["page-size"], "yosegi-table-page-size", props.class]}>
      <Select
        options={options()}
        value={String(size())}
        onChange={(value) => setSize(Number(value))}
        placement="top-start"
      >
        <Select.Label>Rows per page</Select.Label>
        <Select.Trigger />
        <Select.Portal>
          <Select.Content />
        </Select.Portal>
      </Select>
    </div>
  );
}

// ------------------------------------------------------------- From data

export interface TableSelection<T> {
  ids: string[];
  /** The selected rows among `data`; with `manual`, only those on the page. */
  rows: T[];
  clear: () => void;
}

/** The whole box from data and columns: bars, search, Filter, sorting, selection and pages. */
export interface DataTableProps<T> extends Omit<JSX.HTMLAttributes<HTMLElement>, "title" | "children"> {
  data: readonly T[];
  columns: readonly TableColumn<T>[];
  /** Each row's id, for selection: a field or a function. "id" by default. */
  rowKey?: Extract<keyof T, string> | ((row: T) => string);
  title?: JSX.Element;
  description?: JSX.Element;
  /** Buttons on the top bar's right. */
  actions?: JSX.Element;
  /** More controls in the toolbar, after search and Filter. */
  toolbar?: JSX.Element;
  /** What the rows are, in the plural: “Search invoices”, “Show 28 invoices”. "rows" by default. */
  noun?: string;
  /** The search box. True by default. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** How long typing pauses before the search applies: 300ms with `manual`, at once otherwise. */
  searchDelay?: number;
  /** Rows per page; 10 by default. */
  pageSize?: number;
  /** Choices for rows per page, picked in the bottom bar: [10, 20, 50, 100] by default. */
  pageSizeOptions?: number[];
  /** The rows area is this tall whatever the number of rows, and rows scroll inside it, under headings that stay put: 480 or "60vh". */
  height?: number | string;
  /** Like height, but the rows area can be shorter when there are fewer rows. */
  maxHeight?: number | string;
  query?: TableQuery;
  defaultQuery?: Partial<TableQuery>;
  /** Called when the search, a filter, the sort or the page changes. */
  onQueryChange?: (query: TableQuery) => void;
  /** The server searches, filters, sorts and pages: `data` is the page, `rowCount` the total. */
  manual?: boolean;
  /** With `manual`, how many rows match the query. */
  rowCount?: number;
  /** With `manual`, Filter's “Show N” count for a draft. */
  resultCount?: (filters: FilterValue) => number | Promise<number>;
  /** Rows are on their way: the body dims, and the search shows a spinner after a search. */
  loading?: boolean;
  /** A checkbox on each row and the selection bar. */
  selectable?: boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** Buttons on the selection bar, before Clear. */
  selectionActions?: (selection: TableSelection<T>) => JSX.Element;
  /** Opens a row: by click, or Enter when the row has focus. Clicks on buttons, links and checkboxes don't count. */
  onRowClick?: (row: T, event: MouseEvent | KeyboardEvent) => void;
  /** A link in the first cell that covers the row. Takes over from onRowClick. */
  rowHref?: (row: T) => string | undefined;
  /** Shown when there are no rows at all. “No rows yet.” by default. */
  empty?: JSX.Element;
}

/** 480 → "480px"; a string, like "60vh", as it is. */
const cssSize = (value: number | string | undefined) => (typeof value === "number" ? `${value}px` : value);

const width = (value: number | string | undefined) =>
  value === undefined ? undefined : { width: typeof value === "number" ? `${value}px` : value };

const isActive = (value: FilterValue[string]) =>
  Array.isArray(value) ? value.length > 0 : value.from !== undefined || value.to !== undefined;

/** Clicks on these, inside a row, are theirs and don't open the row. */
const fromControl = (event: Event) =>
  event.target instanceof Element &&
  !!event.target.closest("a, button, input, select, textarea, label, .yosegi-checkbox");

function RowCheck(props: {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Checkbox checked={props.checked} indeterminate={props.indeterminate} onChange={props.onChange}>
      <Checkbox.Input aria-label={props.label} />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox>
  );
}

function DataTable<T>(props: DataTableProps<T>) {
  const rest = omit(
    props,
    "data",
    "columns",
    "rowKey",
    "title",
    "description",
    "actions",
    "toolbar",
    "noun",
    "searchable",
    "searchPlaceholder",
    "searchDelay",
    "pageSize",
    "pageSizeOptions",
    "height",
    "maxHeight",
    "query",
    "defaultQuery",
    "onQueryChange",
    "manual",
    "rowCount",
    "resultCount",
    "loading",
    "selectable",
    "selected",
    "defaultSelected",
    "onSelectedChange",
    "selectionActions",
    "onRowClick",
    "rowHref",
    "empty",
    "aria-label",
    "style",
  );
  const title = children(() => props.title);
  const description = children(() => props.description);
  const actions = children(() => props.actions);
  const toolbar = children(() => props.toolbar);
  const empty = children(() => props.empty);
  const titleId = `yosegi-table-title-${createUniqueId()}`;
  const noun = () => props.noun ?? "rows";
  let tableEl: HTMLTableElement | undefined;

  const [query, setQuery] = createControllableSignal<TableQuery>({
    value: () => props.query,
    defaultValue: () => ({ search: "", filters: {}, page: 1, ...props.defaultQuery }),
    onChange: (next) => props.onQueryChange?.(next),
    equals: () => false,
  });
  // Whether the last change was a search, so `loading` shows in the search box.
  const [searchSent, setSearchSent] = createSignal(false, { ownedWrite: true });
  // A change other than the page starts again from the first page.
  const update = (patch: Partial<TableQuery>) => {
    setSearchSent("search" in patch);
    setQuery({ ...untrack(query), page: 1, ...patch });
  };

  // The box shows what was typed at once; the search applies when typing pauses.
  const [text, setText] = createSignal(untrack(query).search, { ownedWrite: true });
  const [pending, setPending] = createSignal(false, { ownedWrite: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));
  const typeSearch = (next: string) => {
    setText(next);
    clearTimeout(timer);
    const delay = props.searchDelay ?? (props.manual ? 300 : 0);
    const send = () => {
      setPending(false);
      update({ search: next });
    };
    if (delay <= 0 || !next.trim()) return send();
    setPending(true);
    timer = setTimeout(send, delay);
  };
  createEffect(
    () => query().search,
    (search) => {
      if (!untrack(pending)) setText(search);
    },
  );
  const searching = () => pending() || (!!props.loading && searchSent());

  // What people picked, or the table's own size.
  const pageSize = () => query().pageSize ?? props.pageSize ?? 10;
  // A new page starts at the top of the scrolling rows.
  const scrollToTop = () => tableEl?.parentElement?.scrollTo({ top: 0 });
  const goTo = (next: number) => {
    update({ page: next });
    scrollToTop();
  };
  // The first row stays on screen: 21–40 at 20 a page becomes 21–30 at 10.
  const setPageSize = (size: number) => {
    const first = untrack(offset);
    update({ pageSize: size, page: Math.floor(first / size) + 1 });
    scrollToTop();
  };

  const filtering = () => query().search.trim() !== "" || Object.values(query().filters).some(isActive);
  const clearAll = () => {
    clearTimeout(timer);
    setPending(false);
    setText("");
    update({ search: "", filters: {} });
  };

  const matching = createMemo(() =>
    props.manual
      ? props.data
      : props.data.filter((row) => rowMatches(row, props.columns, query().filters, query().search)),
  );
  const sorted = createMemo(() => (props.manual ? matching() : sortRows(matching(), props.columns, query().sort)));
  const total = () => (props.manual ? (props.rowCount ?? props.data.length) : matching().length);
  const pageCount = () => Math.max(1, Math.ceil(total() / pageSize()));
  // A page past the end, after the rows shrink, shows the last one.
  const page = () => Math.min(Math.max(1, query().page), pageCount());
  const offset = () => pageOffset(page(), pageSize());
  const pageRows = () => (props.manual ? props.data : sorted().slice(offset(), offset() + pageSize()));
  const allCount = () => (props.manual ? total() : props.data.length);

  const sortBy = (key: string) => {
    const current = untrack(query).sort;
    if (current?.key !== key) return update({ sort: { key, direction: "asc" } });
    update({ sort: current.direction === "asc" ? { key, direction: "desc" } : undefined });
  };

  const [selected, setSelected] = createControllableSignal<string[]>({
    value: () => props.selected,
    defaultValue: () => props.defaultSelected ?? [],
    onChange: (ids) => props.onSelectedChange?.(ids),
    equals: () => false,
  });
  const selectedSet = createMemo(() => new Set(selected()));
  const keyOf = (row: T) =>
    typeof props.rowKey === "function"
      ? props.rowKey(row)
      : String((row as Record<string, unknown>)[props.rowKey ?? "id"]);
  const isSelected = (row: T) => selectedSet().has(keyOf(row));
  const toggle = (rows: readonly T[], on: boolean) => {
    const next = new Set(untrack(selectedSet));
    for (const row of rows) on ? next.add(keyOf(row)) : next.delete(keyOf(row));
    setSelected([...next]);
  };
  const pageSelected = () => pageRows().filter(isSelected).length;
  const selection = (): TableSelection<T> => ({
    ids: selected(),
    rows: props.data.filter(isSelected),
    clear: () => setSelected([]),
  });

  // Filter's “Show N” count: the server's, or the rows the draft leaves. A plain
  // function made once, since Filter reads it inside an effect.
  const countDraft = untrack(() => props.manual && !props.resultCount)
    ? undefined
    : (draft: FilterValue) =>
        props.manual
          ? props.resultCount!(draft)
          : props.data.filter((row) => rowMatches(row, props.columns, draft, untrack(query).search)).length;

  const colspan = () => props.columns.length + (props.selectable ? 1 : 0);
  const filterable = () => props.columns.filter((column) => column.filter);
  const clickable = () => !!props.onRowClick && !props.rowHref;

  return (
    <Box
      {...rest}
      style={mergeStyle(
        { "--yosegi-table-height": cssSize(props.height), "--yosegi-table-max-height": cssSize(props.maxHeight) },
        props.style,
      )}
      data-loading={dataAttr(props.loading)}
      data-scroll={dataAttr(props.height !== undefined || props.maxHeight !== undefined)}
    >
      <Show
        when={props.selectable && selected().length > 0}
        fallback={
          <>
            <Show when={title() || description() || actions()}>
              <TopBar>
                <div>
                  <Show when={title()}>
                    <Title id={titleId}>{title()}</Title>
                  </Show>
                  <Show when={description()}>
                    <Description>{description()}</Description>
                  </Show>
                </div>
                <Show when={actions()}>
                  <Actions>{actions()}</Actions>
                </Show>
              </TopBar>
            </Show>
            <Show when={props.searchable !== false || filterable().length > 0 || toolbar()}>
              <Toolbar>
                <Show when={props.searchable !== false}>
                  <TextField value={text()} onChange={typeSearch} loading={searching()}>
                    <TextField.Group>
                      <TextField.Icon>
                        <SearchIcon />
                      </TextField.Icon>
                      <TextField.Input
                        type="search"
                        placeholder={props.searchPlaceholder ?? `Search ${noun()}`}
                        aria-label={props.searchPlaceholder ?? `Search ${noun()}`}
                      />
                      <Show when={searching()}>
                        <Spinner />
                      </Show>
                    </TextField.Group>
                  </TextField>
                </Show>
                <Show when={filterable().length > 0}>
                  <Filter
                    value={query().filters}
                    onChange={(filters) => update({ filters })}
                    resultCount={countDraft}
                    noun={noun()}
                  >
                    <Filter.Trigger />
                    <Filter.Chips />
                    <Filter.Portal>
                      <Filter.Overlay />
                      <Filter.Content>
                        <Filter.Header>Filters</Filter.Header>
                        <For each={filterable()}>
                          {(column) => {
                            // Read once: in server mode the page's values could flip the kind.
                            const kind = filterKind(
                              column,
                              untrack(() => props.data),
                            );
                            const counts = createMemo(() =>
                              props.manual ? undefined : countValues(column, props.data),
                            );
                            return (
                              <Show
                                when={kind === "range"}
                                fallback={
                                  <Filter.Section name={column.key} title={column.label}>
                                    <For each={filterOptions(column, props.data)} keyed={(option) => option.value}>
                                      {(option) => {
                                        // The key, so it never changes for this option.
                                        const value = untrack(option).value;
                                        return (
                                          <Filter.Option value={value} count={counts() && (counts()![value] ?? 0)}>
                                            {option().label}
                                          </Filter.Option>
                                        );
                                      }}
                                    </For>
                                  </Filter.Section>
                                }
                              >
                                <Filter.Section name={column.key} title={column.label} type="range">
                                  <Filter.Range format={column.format} />
                                </Filter.Section>
                              </Show>
                            );
                          }}
                        </For>
                        <Filter.Footer />
                      </Filter.Content>
                    </Filter.Portal>
                  </Filter>
                </Show>
                {toolbar()}
              </Toolbar>
            </Show>
          </>
        }
      >
        <SelectionBar>
          <span class="yosegi-table-selection-count">
            {count.format(selected().length)} selected <span>of {count.format(allCount())}</span>
          </span>
          <Actions>
            {props.selectionActions?.(selection())}
            <Button label="Clear" variant="ghost" size="sm" onClick={() => setSelected([])} />
          </Actions>
        </SelectionBar>
      </Show>

      <PlainTable
        ref={(el: HTMLTableElement) => (tableEl = el)}
        aria-labelledby={title() ? titleId : undefined}
        aria-label={title() ? undefined : (props["aria-label"] ?? noun())}
        aria-busy={props.loading ? "true" : undefined}
      >
        <Header>
          <Row>
            <Show when={props.selectable}>
              <Head selection>
                <RowCheck
                  label="Select all on this page"
                  checked={pageRows().length > 0 && pageSelected() === pageRows().length}
                  indeterminate={pageSelected() > 0 && pageSelected() < pageRows().length}
                  onChange={(on) => toggle(pageRows(), on)}
                />
              </Head>
            </Show>
            <For each={props.columns}>
              {(column) => {
                const direction = () => (query().sort?.key === column.key ? query().sort!.direction : undefined);
                return (
                  <Head
                    align={column.align}
                    class={column.class}
                    style={width(column.width)}
                    aria-sort={direction() === "asc" ? "ascending" : direction() === "desc" ? "descending" : undefined}
                  >
                    <Show when={column.sortable} fallback={column.label}>
                      <button
                        type="button"
                        class={[styles.sort, "yosegi-table-sort"]}
                        data-direction={direction()}
                        onClick={() => sortBy(column.key)}
                      >
                        {column.label}
                        <ChevronDownIcon />
                      </button>
                    </Show>
                  </Head>
                );
              }}
            </For>
          </Row>
        </Header>
        <Body>
          <For
            each={pageRows()}
            fallback={
              <Empty colspan={colspan()}>
                <Show
                  when={!props.loading}
                  fallback={
                    <>
                      <Spinner />
                      Loading {noun()}…
                    </>
                  }
                >
                  <Show when={filtering()} fallback={empty() ?? <strong>No {noun()} yet.</strong>}>
                    <strong>No {noun()} match.</strong>
                    Try a shorter search or fewer filters, or clear them all.
                    <Button label="Clear filters" variant="outline" size="sm" onClick={clearAll} />
                  </Show>
                </Show>
              </Empty>
            }
            keyed={keyOf}
          >
            {/* Keyed by rowKey, so a refetch that returns fresh objects keeps each row's DOM. */}
            {(row) => (
              <Row
                selected={isSelected(row())}
                data-clickable={dataAttr(props.onRowClick || props.rowHref)}
                tabindex={clickable() ? 0 : undefined}
                onClick={(event) => {
                  if (clickable() && !fromControl(event)) props.onRowClick!(row(), event);
                }}
                onKeyDown={(event) => {
                  if (clickable() && event.key === "Enter" && event.target === event.currentTarget)
                    props.onRowClick!(row(), event);
                }}
              >
                <Show when={props.selectable}>
                  <Cell selection>
                    <RowCheck
                      label={`Select ${keyOf(row())}`}
                      checked={isSelected(row())}
                      onChange={(on) => toggle([row()], on)}
                    />
                  </Cell>
                </Show>
                <For each={props.columns}>
                  {(column) => {
                    const content = () =>
                      column.cell ? column.cell(row(), columnText(column, row())) : columnText(column, row());
                    const href = () => (column === props.columns[0] ? props.rowHref?.(row()) : undefined);
                    return (
                      <Cell align={column.align} class={column.class}>
                        <Show when={href()} fallback={content()}>
                          <a href={href()} class={[styles["row-link"], "yosegi-table-row-link"]}>
                            {content()}
                          </a>
                        </Show>
                      </Cell>
                    );
                  }}
                </For>
              </Row>
            )}
          </For>
        </Body>
      </PlainTable>

      <BottomBar>
        {/* Rows per page hides with Pagination when nothing matches. */}
        <Show when={total() > 0}>
          <PageSize value={pageSize()} onChange={setPageSize} options={props.pageSizeOptions} />
        </Show>
        {/* With no matches, the range reads “0 of 312”: none of all the rows. It's announced when it changes. */}
        <Range aria-live="polite" from={offset() + 1} to={offset() + pageRows().length} total={total() || allCount()} />
        <Show when={total() > 0}>
          <Pagination count={pageCount()} page={page()} onPageChange={goTo} aria-label={`${noun()} pages`} />
        </Show>
      </BottomBar>
    </Box>
  );
}

/** A data table: plain, or in the Box with a top bar, toolbar, selection bar and bottom bar. */
function TableRoot(props: Record<string, any>) {
  return untrack(() => "columns" in props) ? (
    <DataTable {...(props as DataTableProps<unknown>)} />
  ) : (
    <PlainTable {...props} />
  );
}

interface TableComponent {
  /** The whole box from data and columns. */
  <T>(props: DataTableProps<T>): JSX.Element;
  /** A plain table you put together from the parts. */
  (props: JSX.HTMLAttributes<HTMLTableElement>): JSX.Element;
}

export const Table = Object.assign(TableRoot as TableComponent, {
  /** The surface around a table and its bars. */
  Box,
  /** Title on the left, actions on the right. */
  TopBar,
  Title,
  Description,
  Actions,
  /** Search, Filter and its chips. */
  Toolbar,
  /** Takes the place of TopBar and Toolbar while rows are selected; a status region, so the count is announced. */
  SelectionBar,
  Caption: createPart<HTMLTableCaptionElement>("caption", styles.caption, "yosegi-table-caption"),
  Header,
  Body,
  Footer: createPart<HTMLTableSectionElement>("tfoot", styles.footer, "yosegi-table-footer"),
  Row,
  Head,
  Cell,
  Empty,
  /** Rows per page and the range on the left, Pagination on the right. */
  BottomBar,
  /** “Rows per page” and a small Select: 10, 20, 50, 100. */
  PageSize,
  Range,
});
