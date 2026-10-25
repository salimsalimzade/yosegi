import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal } from "solid-js";
import { Pagination, Table } from "yosegi";

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
