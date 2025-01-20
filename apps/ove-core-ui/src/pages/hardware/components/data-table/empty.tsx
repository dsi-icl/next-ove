import React from "react";
import { TableCell, TableRow } from "@ove/ui-base-components";

const Empty = ({ length }: { length: number }) => <TableRow
  className="even:bg-[#f2f2f2] odd:bg-[#fff] hover:bg-[#ddd]">
  <TableCell className="text-center" colSpan={length}>
    No results.
  </TableCell>
</TableRow>;

export default Empty;
