type TruncatedTextCellProps = {
  text: string;
  paddingLeft?: string;
  paddingRight?: string;
  color?: string;
  textAlign?: "end";
};

export function TruncatedTextCell({
  text,
  paddingLeft,
  paddingRight,
  color,
  textAlign,
}: TruncatedTextCellProps) {
  return (
    <p
      style={{
        paddingTop: "5px",
        paddingBottom: "5px",
        paddingLeft: paddingLeft ?? "12px",
        paddingRight,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "clip",
        fontSize: "14px",
        color: color ?? "#393A3D",
        textAlign,
      }}
    >
      {text}
    </p>
  );
}
