import {
  flexRender,
  Header,
  Table as TanstackTable,
} from "@tanstack/react-table";
import { handleRightOnlyResize } from "./column-resize";
// import { ColumnResizer } from "../../../ColumnResizer";
// import { DescendingSortIcon } from "../icons/DescendingSortIcon";
// import { AscendingSortIcon } from "../icons/AscendingSortIcon";

export type DataTableHeaderCellProps<TData extends object> = {
  header: Header<TData, unknown>;
  table: TanstackTable<TData>;
};

export function DataTableHeaderCell<TData extends object>({
  header,
  table,
}: DataTableHeaderCellProps<TData>) {
  const borderRightWidth = header.column.getIsLastColumn() ? undefined : "1px";
  let sortIcon = null;
  const sortValue = header.column.getIsSorted();

  // if (sortValue == "asc") {
  //   sortIcon = <AscendingSortIcon />;
  // } else if (sortValue == "desc") {
  //   sortIcon = <DescendingSortIcon />;
  // }

  return (
    <>
      <th
        style={{
          textAlign: "left",
          color: "#393a3d",
          borderRightWidth,
          borderRightStyle: "solid",
          borderRightColor: "#c0d0e4",
          borderBottomWidth: "3px",
          maxWidth: `${header.getSize()}px`,
          width: `${header.getSize()}px`,
          minWidth: "0px",
        }}
      >
        <div className="flex flex-row h-screen" style={{ height: "100%" }}>
          <div
            className="flex flex-row items-center cursor-pointer"
            onClick={header.column.getToggleSortingHandler()}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "clip",
              width: "100%",
            }}
          >
            <div
              style={{
                height: "100%",
                fontSize: "14px",
                paddingLeft: "10px",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
            </div>
            {sortIcon}
          </div>
          {/* {header.column.getCanResize() && !header.column.getIsLastColumn() && (
            <ColumnResizer
              onMouseDown={handleRightOnlyResize<TData>({ header, table })}
            />
          )} */}
        </div>
      </th>
    </>
  );
}
