import React, { memo } from "react";
import { TableCell, TableRow } from "@ove/ui-base-components";
import { flexRender, type Row } from "@tanstack/react-table";

// type of row not needed except for id key
const BodyRow = memo(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ row }: { row: Row<any> }) => (
    <TableRow
      id={row.id}
      className="odd:bg-white even:bg-[#f2f2f2] hover:bg-[#ddd]"
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell className="text-center" key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ),
  (prev, next) => prev.row.id === next.row.id,
);
BodyRow.displayName = "BodyRow";

export default BodyRow;
