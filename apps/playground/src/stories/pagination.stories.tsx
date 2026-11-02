import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { expect, fn } from "storybook/test";
import { createSignal } from "solid-js";
import { Pagination, Table } from "yosegi-solid";

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  parameters: {
    stage: "fill",
    docs: {
      description: {
        component: "Numbered pages with Previous and Next, for moving through a table or a long list a page at a time.",
      },
    },
  },
  args: { count: 16, defaultPage: 8, siblingCount: 1, showLabels: true },
  argTypes: {
    count: { control: { type: "number", min: 1 } },
    siblingCount: { control: { type: "number", min: 0, max: 3 } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Previous is off. */
export const FirstPage: Story = {
  name: "First page",
  render: () => <Pagination count={16} defaultPage={1} />,
};

/** One page either side of the current one, gaps on both sides. Try it: the bar keeps its width. */
export const Middle: Story = {
  render: () => {
    const [page, setPage] = createSignal(8);
    return <Pagination count={16} page={page()} onPageChange={setPage} />;
  },
};

/** Next is off. */
export const LastPage: Story = {
  name: "Last page",
  render: () => <Pagination count={16} defaultPage={16} />,
};

/** Seven or fewer: every number, no gaps. */
export const FewPages: Story = {
  name: "Few pages",
  render: () => <Pagination count={5} defaultPage={2} />,
};

/** showLabels={false}: arrows only, still named for screen readers. */
export const Narrow: Story = {
  render: () => <Pagination count={16} defaultPage={8} showLabels={false} />,
};

/** siblingCount={2}. */
export const TwoPagesEitherSide: Story = {
  name: "Two pages either side",
  render: () => <Pagination count={30} defaultPage={15} siblingCount={2} />,
};

/** The range on the left, pages on the right. */
export const InATable: Story = {
  name: "In a table",
  render: () => {
    const [page, setPage] = createSignal(3);
    return (
      <Table.Box>
        <Table.BottomBar>
          <Table.Range from={(page() - 1) * 10 + 1} to={Math.min(page() * 10, 312)} total={312} />
          <Pagination count={32} page={page()} onPageChange={setPage} aria-label="Invoice pages" />
        </Table.BottomBar>
      </Table.Box>
    );
  },
};

// Tests: run by Vitest (`pnpm test`), hidden from the sidebar and the docs.

/** Test: Next and Previous move a page, a number jumps to it, and the ends turn off the arrows. */
export const MovingTest: Story = {
  name: "Moving (test)",
  tags: ["!dev", "!autodocs"],
  render: () => <Pagination count={5} defaultPage={1} />,
  play: async ({ canvas, userEvent }) => {
    const previous = canvas.getByRole("button", { name: "Previous page" });
    const next = canvas.getByRole("button", { name: "Next page" });
    const page = (n: number) => canvas.getByRole("button", { name: `Page ${n}` });

    await expect(canvas.getByRole("navigation", { name: "Pages" })).toBeInTheDocument();
    await expect(page(1)).toHaveAttribute("aria-current", "page");
    await expect(previous).toBeDisabled();

    await userEvent.click(next);
    await expect(page(2)).toHaveAttribute("aria-current", "page");
    await expect(page(1)).not.toHaveAttribute("aria-current");

    await userEvent.click(page(5));
    await expect(next).toBeDisabled();
    await userEvent.click(previous);
    await expect(page(4)).toHaveAttribute("aria-current", "page");
  },
};

/** Test: onPageChange hears each move. */
export const OnPageChangeTest: Story = {
  name: "onPageChange (test)",
  tags: ["!dev", "!autodocs"],
  args: { onPageChange: fn() },
  render: (args) => <Pagination count={16} defaultPage={8} onPageChange={args.onPageChange} />,
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Next page" }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(9);
    await userEvent.click(canvas.getByRole("button", { name: "Page 16" }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(16);
  },
};
