import { TableCell, TableHeader as TableHeaderBase, TableRow } from "@ove/ui-base-components";

const TableHeader = () => <TableHeaderBase>
  <TableRow>
    <TableCell className="w-1/2 font-semibold">Property</TableCell>
    <TableCell className="w-1/2 font-semibold">Value</TableCell>
  </TableRow>
</TableHeaderBase>

export default TableHeader;
