import { createSignal } from "solid-js";
import { Pagination, Table } from "yosegi";
import { Case } from "../ui/case";

export function PaginationPage() {
  const [page, setPage] = createSignal(8);
  const [tablePage, setTablePage] = createSignal(3);

  return (
    <>
      <Case title="First page" description="Previous is off." layout="fill">
        <Pagination count={16} defaultPage={1} />
      </Case>
      <Case title="Middle" description="One page either side of the current one, gaps on both sides. Try it: the bar keeps its width." layout="fill">
        <Pagination count={16} page={page()} onPageChange={setPage} />
      </Case>
      <Case title="Last page" description="Next is off." layout="fill">
        <Pagination count={16} defaultPage={16} />
      </Case>
      <Case title="Few pages" description="Seven or fewer: every number, no gaps." layout="fill">
        <Pagination count={5} defaultPage={2} />
      </Case>
      <Case title="Narrow" description="showLabels={false}: arrows only, still named for screen readers." layout="fill">
        <Pagination count={16} defaultPage={8} showLabels={false} />
      </Case>
      <Case title="Two pages either side" description="siblingCount={2}." layout="fill">
        <Pagination count={30} defaultPage={15} siblingCount={2} />
      </Case>
      <Case title="In a table" description="The range on the left, pages on the right." layout="fill">
        <Table.Box>
          <Table.BottomBar>
            <Table.Range from={(tablePage() - 1) * 10 + 1} to={Math.min(tablePage() * 10, 312)} total={312} />
            <Pagination count={32} page={tablePage()} onPageChange={setTablePage} aria-label="Invoice pages" />
          </Table.BottomBar>
        </Table.Box>
      </Case>
    </>
  );
}
