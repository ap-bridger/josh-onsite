import { DisplayColumnDef } from "@tanstack/react-table";
import { ChangeEventHandler } from "react";

export const selectColumn = <T extends object>(): DisplayColumnDef<T> => ({
  id: "selected",
  enableResizing: false,
  size: 40,
  header: ({ table }) => {
    const checked = table.getIsAllRowsSelected();
    return (
      <StyledCheckbox
        checked={checked}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    );
  },
  cell: ({ row }) => {
    return (
      <StyledCheckbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    );
  },
});

type StyledCheckboxProps = {
  checked: boolean;
  onChange: ChangeEventHandler;
};
function StyledCheckbox({ checked, onChange }: StyledCheckboxProps) {
  const backgroundColor = checked ? "#0C0045" : undefined;
  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <input
        type="checkbox"
        className="form-checkbox focus:ring-0 focus:ring-offset-0 focus:outline-none outline-none"
        style={{
          width: "20px",
          height: "20px",
          borderWidth: "1px",
          borderColor: "#8d9096",
          borderStyle: "solid",
          borderRadius: "2px",
          backgroundColor,
        }}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}
