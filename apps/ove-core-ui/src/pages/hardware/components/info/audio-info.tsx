import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import Header from "./header";
import { format } from "./utils";
import type { Systeminformation } from "systeminformation";

const AudioInfo = ({ info }: { info: { audio: Systeminformation.AudioData[] } }) => <div>
  {info["audio"]?.map((audio, i) => <div key={i}>
    <h4 className="font-bold mt-6">Audio Device - {i}</h4>
    <Table>
      <Header />
      <TableBody>
        <TableRow>
          <TableCell>id</TableCell>
          <TableCell className="text-wrap break-words break-all">{format(audio?.["id"])}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>name</TableCell>
          <TableCell>{format(audio?.name)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>manufacturer</TableCell>
          <TableCell>{format(audio?.manufacturer)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>revision</TableCell>
          <TableCell>{format(audio?.revision)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>driver</TableCell>
          <TableCell>{format(audio?.driver)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>default</TableCell>
          <TableCell>{format(audio?.default)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>channel</TableCell>
          <TableCell>{format(audio?.channel)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>type</TableCell>
          <TableCell>{format(audio?.type)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>in</TableCell>
          <TableCell>{format(audio?.in)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>out</TableCell>
          <TableCell>{format(audio?.out)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>status</TableCell>
          <TableCell>{format(audio?.status)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
</div>;

export default AudioInfo;
