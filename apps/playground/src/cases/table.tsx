import { For } from "solid-js";
import { Table } from "yosegi";
import { Case } from "../ui/case";

const invoices = [
  { id: "INV-001", status: "Paid", method: "Card", amount: 250 },
  { id: "INV-002", status: "Pending", method: "Bank transfer", amount: 150 },
  { id: "INV-003", status: "Unpaid", method: "Card", amount: 350 },
  { id: "INV-004", status: "Paid", method: "Cash", amount: 450 },
];

const money = new Intl.NumberFormat("en", { style: "currency", currency: "USD" });

export function TablePage() {
  return (
    <>
      <Case title="With a caption and a footer" description={'Head, Body, Footer and Caption; align="end" for amounts.'} layout="fill">
        <Table>
          <Table.Caption>Your recent invoices.</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.Head>Invoice</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Method</Table.Head>
              <Table.Head align="end">Amount</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <For each={invoices}>
              {(invoice) => (
                <Table.Row>
                  <Table.Cell>{invoice.id}</Table.Cell>
                  <Table.Cell>{invoice.status}</Table.Cell>
                  <Table.Cell>{invoice.method}</Table.Cell>
                  <Table.Cell align="end">{money.format(invoice.amount)}</Table.Cell>
                </Table.Row>
              )}
            </For>
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.Cell colspan={3}>Total</Table.Cell>
              <Table.Cell align="end">{money.format(invoices.reduce((sum, i) => sum + i.amount, 0))}</Table.Cell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Case>

      <Case title="A selected row" description="selected marks the chosen row with an accent edge." layout="fill">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
              <Table.Head>Role</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <For each={[["Salim", "Owner"], ["Aiko", "Editor"], ["Mateo", "Viewer"]]}>
              {([name, role]) => (
                <Table.Row selected={name === "Aiko"}>
                  <Table.Cell>{name}</Table.Cell>
                  <Table.Cell>{role}</Table.Cell>
                </Table.Row>
              )}
            </For>
          </Table.Body>
        </Table>
      </Case>
    </>
  );
}
