import { type Table as TableType } from "@tanstack/react-table";
import { type RowSubComponent } from "./DataTable.component";
import { DataTableCell } from "./DataTableCell.component";

type DataTableBodyProps<TData> = {
  table: TableType<TData>;
  error?: unknown;
  isLoading?: boolean;
  renderSubComponent?: RowSubComponent<TData>;
};

export function DataTableBody<TData>({ table }: DataTableBodyProps<TData>) {
  const rows = table.getRowModel().rows;
  return (
    <tbody>
      {rows.map((row) => (
        <tr key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <DataTableCell cell={cell} key={cell.id} />
          ))}
        </tr>
      ))}
    </tbody>
  );
}
