import { Header, Table } from "@tanstack/react-table";

type RightOnlyResizeProps<TData> = {
  header: Header<TData, unknown>;
  table: Table<TData>;
};
export function handleRightOnlyResize<TData extends object>({
  header,
  table,
}: RightOnlyResizeProps<TData>) {
  return (e: React.MouseEvent) => {
    const startSize = header.column.getSize();
    const startX = e.clientX;
    const allColumns = table.getAllLeafColumns();
    const rightColumns = allColumns.slice(header.index + 1);
    const startSizes = Object.fromEntries(
      allColumns.map((col) => [col.id, col.getSize()])
    );
    const maxRightShrink = rightColumns.reduce((sum, column) => {
      return sum + column.getSize() - (column.columnDef.minSize || 0);
    }, 0);
    const totalRightStartSize = rightColumns.reduce((sum, column) => {
      return sum + column.getSize();
    }, 0);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const minSize = header.column.columnDef.minSize || 0;
      const maxShrink = startSize - minSize;
      const actualDiff = Math.min(
        Math.max(diff, -1 * maxShrink),
        maxRightShrink
      );
      console.log("ACTUAL", actualDiff);
      const columnSizing = table.getState().columnSizing;
      const totalRightChange = -1 * actualDiff;

      let currentRightChange = 0;
      for (const column of allColumns) {
        console.log(
          "TOTAL ROOM:",
          maxRightShrink,
          "TOTAL CHANGE",
          totalRightChange
        );
        if (column.getIndex() < header.index) {
          columnSizing[column.id] = column.getSize();
        } else if (column.getIndex() == header.index) {
          columnSizing[column.id] = startSize + actualDiff;
        } else {
          if (column.getIndex() == allColumns.length - 1) {
            const remainingRightChange = totalRightChange - currentRightChange;
            console.log("REMAINING:", remainingRightChange);
            columnSizing[column.id] =
              startSizes[column.id] + remainingRightChange;
          } else {
            let columnChange;
            if (totalRightChange < 0) {
              const roomInColumn =
                startSizes[column.id] - (column.columnDef.minSize || 0);
              columnChange = totalRightChange * (roomInColumn / maxRightShrink);
            } else {
              // When growing the right side, grow in proportion to the starting size of each
              // column, rather than the amount of space left like when shrinking
              columnChange =
                totalRightChange *
                (startSizes[column.id] / totalRightStartSize);
            }
            columnSizing[column.id] = startSizes[column.id] + columnChange;
            console.log("CHANGE IN COLUMN:", columnChange);
            currentRightChange += columnChange;
          }
        }
      }

      console.log("SIZING", columnSizing, "TOTAL");
      table.setColumnSizing(columnSizing);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
}
