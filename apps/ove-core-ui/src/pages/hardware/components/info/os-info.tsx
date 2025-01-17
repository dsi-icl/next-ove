import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";

const OSInfo = ({ info }: {
  info: {
    os: Systeminformation.OsData
    uuid: Systeminformation.UuidData
    versions: Systeminformation.VersionData
    shell: string
    users: Systeminformation.UserData[]
  }
}) => <div>
  <h4 className="font-bold mt-6">General</h4>
  <Table>
    <TableHeader />
    <TableBody>
      <TableRow>
        <TableCell>platform</TableCell>
        <TableCell>{format(info.os?.platform)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>distro</TableCell>
        <TableCell>{format(info.os?.distro)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>release</TableCell>
        <TableCell>{format(info.os?.release)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>codename</TableCell>
        <TableCell>{format(info.os?.codename)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>kernel</TableCell>
        <TableCell>{format(info.os?.kernel)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>arch</TableCell>
        <TableCell>{format(info.os?.arch)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>hostname</TableCell>
        <TableCell>{format(info.os?.hostname)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>fqdn</TableCell>
        <TableCell>{format(info.os?.fqdn)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>codepage</TableCell>
        <TableCell>{format(info.os?.codepage)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>logo file</TableCell>
        <TableCell>{format(info.os?.logofile)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>serial</TableCell>
        <TableCell>{format(info.os?.serial)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>build</TableCell>
        <TableCell>{format(info.os?.build)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>service pack</TableCell>
        <TableCell>{format(info.os?.servicepack)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>uefi</TableCell>
        <TableCell>{format(info.os?.uefi)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>hypervisor</TableCell>
        <TableCell>{format(info.os?.hypervizor)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>remote session</TableCell>
        <TableCell>{format(info.os?.remoteSession)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>shell</TableCell>
        <TableCell>{format(info?.shell)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <h4 className="font-bold mt-6">UUIDs</h4>
  <Table>
    <TableHeader />
    <TableBody>
      <TableRow>
        <TableCell>os</TableCell>
        <TableCell>{format(info.uuid?.os)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>hardware</TableCell>
        <TableCell>{format(info.uuid?.hardware)}</TableCell>
      </TableRow>
      {info.uuid?.macs?.map((mac, i) => <TableRow
        key={mac}>
        <TableCell>mac address - {i}</TableCell>
        <TableCell>{mac}</TableCell>
      </TableRow>) ?? null}
    </TableBody>
  </Table>
  <h4 className="font-bold mt-6">Versions</h4>
  <Table>
    <TableHeader />
    <TableBody>
      {Object.entries(info.versions ?? {}).map(([k, v]) => <TableRow key={k.toLowerCase()}>
        <TableCell>{k.toLowerCase()}</TableCell>
        <TableCell>{format(v)}</TableCell>
      </TableRow>)}
    </TableBody>
  </Table>
  {info.users?.map((user, i) => <div key={i}>
    <h4 className="font-bold mt-6">User - {user?.user}</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>tty</TableCell>
          <TableCell>{format(user?.tty)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>date</TableCell>
          <TableCell>{format(user?.date)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>time</TableCell>
          <TableCell>{format(user?.time)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ip</TableCell>
          <TableCell>{format(user?.ip)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>command</TableCell>
          <TableCell>{format(user?.command)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
</div>;

export default OSInfo;
