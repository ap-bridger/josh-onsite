import { Cell, flexRender } from "@tanstack/react-table";
import { useRef } from "react";

type DataTableCellProps<TData> = {
  cell: Cell<TData, unknown>;
};

export function DataTableCell<TData>({ cell }: DataTableCellProps<TData>) {
  const ref = useRef<HTMLTableCellElement>(null);
  const content = flexRender(cell.column.columnDef.cell, cell.getContext());
  const borderRightWidth = cell.column.getIsLastColumn() ? undefined : "1px";
  return (
    <td
      ref={ref}
      style={{
        borderRightWidth,
        borderRightStyle: "solid",
        borderRightColor: "#d4d7dc",
        borderBottomColor: "#d4d7dc",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        // Important: maxWidth not width. Not sure why, but it seems to pass down to the child and
        // prevent clipping if you use width
        maxWidth: `${cell.column.getSize()}px`,
        minWidth: 0,
      }}
    >
      {content}
    </td>
  );
}
