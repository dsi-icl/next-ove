import { TableCell, TableHeader, TableRow } from "@ove/ui-base-components";

const Header = () => <TableHeader>
  <TableRow>
    <TableCell className="w-1/2">Property</TableCell>
    <TableCell className="w-1/2">Value</TableCell>
  </TableRow>
</TableHeader>

export default Header;
