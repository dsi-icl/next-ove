import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import TableHeader from "../table-header";
import type { Systeminformation } from "systeminformation";
import { format } from "../../utils";

const VboxInfo = ({ info }: {
  info: { vbox: Systeminformation.VboxInfoData[] }
}) => <div>
  {info?.vbox?.map((vbox, i) => <div key={i}>
    <h4 className="font-bold mt-6">Vbox - {i}</h4>
    <Table>
      <TableHeader />
      <TableBody>
        <TableRow>
          <TableCell>id</TableCell>
          <TableCell>{format(vbox?.id)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>name</TableCell>
          <TableCell>{format(vbox?.name)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>running</TableCell>
          <TableCell>{format(vbox?.running)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>started</TableCell>
          <TableCell>{format(vbox?.started)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>running since</TableCell>
          <TableCell>{new Date(vbox?.runningSince).toISOString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>stopped</TableCell>
          <TableCell>{format(vbox?.stopped)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>stopped since</TableCell>
          <TableCell>{new Date(vbox?.stoppedSince).toISOString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>guest os</TableCell>
          <TableCell>{format(vbox?.guestOS)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>hardware uuid</TableCell>
          <TableCell>{format(vbox?.hardwareUUID)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>memory</TableCell>
          <TableCell>{format(vbox?.memory)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>vram</TableCell>
          <TableCell>{format(vbox?.vram)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpus</TableCell>
          <TableCell>{format(vbox?.cpus)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu exec cap</TableCell>
          <TableCell>{format(vbox?.cpuExepCap)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu profile</TableCell>
          <TableCell>{format(vbox?.cpuProfile)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>chipset</TableCell>
          <TableCell>{format(vbox?.chipset)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>firmware</TableCell>
          <TableCell>{format(vbox?.firmware)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>page fusion</TableCell>
          <TableCell>{format(vbox?.pageFusion)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>configuration file</TableCell>
          <TableCell>{format(vbox?.configFile)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>snapshot folder</TableCell>
          <TableCell>{format(vbox?.snapshotFolder)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>log folder</TableCell>
          <TableCell>{format(vbox?.logFolder)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>hpet</TableCell>
          <TableCell>{format(vbox?.hpet)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>pae</TableCell>
          <TableCell>{format(vbox?.pae)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>long mode</TableCell>
          <TableCell>{format(vbox?.longMode)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>triple fault reset</TableCell>
          <TableCell>{format(vbox?.tripleFaultReset)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>apic</TableCell>
          <TableCell>{format(vbox?.apic)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>x2apic</TableCell>
          <TableCell>{format(vbox?.x2Apic)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>acpi</TableCell>
          <TableCell>{format(vbox?.acpi)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>ioapic</TableCell>
          <TableCell>{format(vbox?.ioApic)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>bios apic mode</TableCell>
          <TableCell>{format(vbox?.biosApicMode)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>boot menu mode</TableCell>
          <TableCell>{format(vbox?.bootMenuMode)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>boot device 1</TableCell>
          <TableCell>{format(vbox?.bootDevice1)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>boot device 2</TableCell>
          <TableCell>{format(vbox?.bootDevice2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>boot device 3</TableCell>
          <TableCell>{format(vbox?.bootDevice3)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>boot device 4</TableCell>
          <TableCell>{format(vbox?.bootDevice4)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>time offset</TableCell>
          <TableCell>{format(vbox?.timeOffset)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>rtc</TableCell>
          <TableCell>{format(vbox?.rtc)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
</div>;

export default VboxInfo;
