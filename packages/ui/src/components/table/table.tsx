import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { createPart } from "../../primitives/create-part";
import { dataAttr } from "../../primitives/dom";
import styles from "./table.module.scss";

/** A plain data table: rows on hairlines, muted label-type headings, tabular figures. */
function TableRoot(props: JSX.HTMLAttributes<HTMLTableElement>) {
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
  /** Highlights the row, for the chosen one in a list. */
  selected?: boolean;
}

function Row(props: TableRowProps) {
  const rest = omit(props, "selected", "class", "children");

  return (
    <tr
      {...rest}
      class={[styles.row, "yosegi-table-row", props.class]}
      data-selected={dataAttr(props.selected)}
    >
      {props.children}
    </tr>
  );
}

type Align = { align?: "start" | "center" | "end" };

function Head(props: Omit<JSX.ThHTMLAttributes<HTMLTableCellElement>, "align"> & Align) {
  const rest = omit(props, "align", "class", "children");
  return (
    <th scope="col" {...rest} class={[styles.head, "yosegi-table-head", props.class]} data-align={props.align}>
      {props.children}
    </th>
  );
}

function Cell(props: Omit<JSX.TdHTMLAttributes<HTMLTableCellElement>, "align"> & Align) {
  const rest = omit(props, "align", "class", "children");
  return (
    <td {...rest} class={[styles.cell, "yosegi-table-cell", props.class]} data-align={props.align}>
      {props.children}
    </td>
  );
}

export const Table = Object.assign(TableRoot, {
  Caption: createPart<HTMLTableCaptionElement>("caption", styles.caption, "yosegi-table-caption"),
  Header: createPart<HTMLTableSectionElement>("thead", styles.header, "yosegi-table-header"),
  Body: createPart<HTMLTableSectionElement>("tbody", styles.body, "yosegi-table-body"),
  Footer: createPart<HTMLTableSectionElement>("tfoot", styles.footer, "yosegi-table-footer"),
  Row,
  /** A column heading. align="end" for numbers. */
  Head,
  /** align="end" for numbers. */
  Cell,
});
