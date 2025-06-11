import React from "react";
import { TableCell, TableRow } from "@ove/ui-base-components";

const Empty = ({ length }: { length: number }) => (
  <TableRow className="odd:bg-white even:bg-[#f2f2f2] hover:bg-[#ddd]">
    <TableCell className="text-center" colSpan={length}>
      No results.
    </TableCell>
  </TableRow>
);

export default Empty;
