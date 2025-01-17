import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import type { PJLinkInfo } from "@ove/ove-types";
import TableHeader from "../table-header";
import { format } from "../../utils";

const PJLinkInfo = ({info}: {info: PJLinkInfo}) => <Table className="mt-6">
  <TableHeader />
  <TableBody>
    <TableRow>
      <TableCell>power</TableCell>
      <TableCell>{format(info.power)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>source</TableCell>
      <TableCell>{format(info.source)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>sources</TableCell>
      <TableCell>{format(info.sources)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>is muted</TableCell>
      <TableCell>{format(info.isMuted)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>is audio muted</TableCell>
      <TableCell>{format(info.isAudioMuted)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>is video muted</TableCell>
      <TableCell>{format(info.isVideoMuted)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>info</TableCell>
      <TableCell>{format(info.info)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>product</TableCell>
      <TableCell>{format(info.product)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>lamp</TableCell>
      <TableCell>{format(info.lamp)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>manufacturer</TableCell>
      <TableCell>{format(info.manufacturer)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>name</TableCell>
      <TableCell>{format(info.name)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>pjlink class</TableCell>
      <TableCell>{format(info.pjlinkClass)}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>errors</TableCell>
      <TableCell>{format(info.errors)}</TableCell>
    </TableRow>
  </TableBody>
</Table>;

export default PJLinkInfo;
