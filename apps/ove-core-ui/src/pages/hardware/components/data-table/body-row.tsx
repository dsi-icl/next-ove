import React, { memo } from "react";
import { TableCell, TableRow } from "@ove/ui-base-components";
import { flexRender, type Row } from "@tanstack/react-table";

const BodyRow = memo(({row}: {row: Row<any>}) =>
  <TableRow id={row.id}
            className="even:bg-[#f2f2f2] odd:bg-[#fff] hover:bg-[#ddd]"
            data-state={row.getIsSelected() && "selected"}>
    {row.getVisibleCells().map(cell => <TableCell className="text-center"
                                                  key={cell.id}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>)}
  </TableRow>, (prev, next) => prev.row.id === next.row.id);

export default BodyRow;
