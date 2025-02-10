import { TableHead, TableRow } from "@ove/ui-base-components";
import { flexRender, type HeaderGroup } from "@tanstack/react-table";
import React, { memo } from "react";

const getSize = (id: string) => {
  switch (id) {
    case "protocol":
      return "5%";
    case "id":
      return "18%";
    case "hostname":
      return "18%";
    case "mac":
      return "18%";
    case "tags":
      return "36%";
    case "status":
      return "5%";
    case "actions":
      return "18%";
    default:
      return "100%";
  }
};

// type of header group does not matter, provided it has id key
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeaderRow = memo(({ group }: { group: HeaderGroup<any> }) => (
  <TableRow>
    {group.headers.map((header) => (
      <TableHead
        key={header.id}
        style={{
          width: getSize(header.id),
          maxWidth: getSize(header.id),
          minWidth: getSize(header.id),
        }}
        className="bg-[#002147] text-center text-white"
      >
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
      </TableHead>
    ))}
  </TableRow>
));
HeaderRow.displayName = "HeaderRow";

export default HeaderRow;
