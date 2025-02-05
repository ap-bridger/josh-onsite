import {
  ColumnDef,
  getCoreRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import { DataTableHeaderCell } from "./DataTableHeaderCell.component";
import { DataTableBody } from "./DataTableBody.component";

export type RowSubComponent<TData> = (props: {
  row: Row<TData>;
}) => React.ReactElement;

export type TableSortingProps = {
  sortingState: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
};

export type DataTableProps<TData extends object> = {
  data: TData[];
  // We explicitly want to be able to take in columns of any value type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  sortingProps?: TableSortingProps;
  isLoading?: boolean;
};

export function DataTable<TData extends object>({
  data,
  columns,
  sortingProps,
}: DataTableProps<TData>) {
  const table = useReactTable({
    columnResizeMode: "onChange",
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: !!sortingProps,
    onSortingChange: sortingProps?.onSortingChange,
    state: {
      sorting: sortingProps?.sortingState,
    },
  });
  return (
    <table className="table-fixed" style={{ width: "1100px" }}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <DataTableHeaderCell
                  header={header}
                  table={table}
                  key={header.id + headerGroup.id}
                />
              );
            })}
          </tr>
        ))}
      </thead>
      <DataTableBody table={table} />
    </table>
  );
}
