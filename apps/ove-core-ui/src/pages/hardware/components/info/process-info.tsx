import { Table, TableBody, TableCell, TableRow } from "@ove/ui-base-components";
import Header from "./header";
import { format } from "./utils";
import type { Systeminformation } from "systeminformation";

const ProcessInfo = ({ info }: {
  info: {
    currentLoad: Systeminformation.CurrentLoadData
    fullLoad: number
    processes: Systeminformation.ProcessesData
    services: Systeminformation.ServicesData[]
    processLoad: Systeminformation.ProcessesProcessLoadData[]
  }
}) => <div>
  <h4 className="font-bold mt-6">General</h4>
  <Table>
    <Header />
    <TableBody>
      <TableRow>
        <TableCell>average load</TableCell>
        <TableCell>{format(info.currentLoad?.avgLoad)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>current load</TableCell>
        <TableCell>{format(info.currentLoad?.currentLoad)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>current user load</TableCell>
        <TableCell>{format(info.currentLoad?.currentLoadUser)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>current system load</TableCell>
        <TableCell>{format(info.currentLoad?.currentLoadSystem)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>current nice load</TableCell>
        <TableCell>{format(info.currentLoad?.currentLoadNice)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>current irq load</TableCell>
        <TableCell>{format(info.currentLoad?.currentLoadIrq)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>current steal load</TableCell>
        <TableCell>{format(info.currentLoad?.currentLoadSteal)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>current guest load</TableCell>
        <TableCell>{format(info.currentLoad?.currentLoadGuest)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>raw current load</TableCell>
        <TableCell>{format(info.currentLoad?.rawCurrentLoad)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>raw current user load</TableCell>
        <TableCell>{format(info.currentLoad?.rawCurrentLoadUser)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>raw current system load</TableCell>
        <TableCell>{format(info.currentLoad?.rawCurrentLoadSystem)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>raw current nice load</TableCell>
        <TableCell>{format(info.currentLoad?.rawCurrentLoadNice)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>raw current irq load</TableCell>
        <TableCell>{format(info.currentLoad?.rawCurrentLoadIrq)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>raw current steal load</TableCell>
        <TableCell>{format(info.currentLoad?.rawCurrentLoadSteal)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>raw current guest load</TableCell>
        <TableCell>{format(info.currentLoad?.rawCurrentLoadGuest)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>full load</TableCell>
        <TableCell>{format(info.fullLoad)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>all processes</TableCell>
        <TableCell>{format(info.processes?.all)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>running processes</TableCell>
        <TableCell>{format(info.processes?.running)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>blocked processes</TableCell>
        <TableCell>{format(info.processes?.blocked)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>sleeping processes</TableCell>
        <TableCell>{format(info.processes?.sleeping)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>unknown processes</TableCell>
        <TableCell>{format(info.processes?.unknown)}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  {info.currentLoad?.cpus?.map((cpu, i) => <div key={i}>
    <h4 className="font-bold mt-6">CPU Core - {i}</h4>
    <Table>
      <Header />
      <TableBody>
        <TableRow>
          <TableCell>load</TableCell>
          <TableCell>{format(cpu?.load)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>user load</TableCell>
          <TableCell>{format(cpu?.loadUser)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>system load</TableCell>
          <TableCell>{format(cpu?.loadSystem)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>nice load</TableCell>
          <TableCell>{format(cpu?.loadNice)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>idle load</TableCell>
          <TableCell>{format(cpu?.loadIdle)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>irq load</TableCell>
          <TableCell>{format(cpu?.loadIrq)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>steal load</TableCell>
          <TableCell>{format(cpu?.loadSteal)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>guest load</TableCell>
          <TableCell>{format(cpu?.loadGuest)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>raw load</TableCell>
          <TableCell>{format(cpu?.rawLoad)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>raw user load</TableCell>
          <TableCell>{format(cpu?.rawLoadUser)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>raw system load</TableCell>
          <TableCell>{format(cpu?.rawLoadSystem)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>raw nice load</TableCell>
          <TableCell>{format(cpu?.rawLoadNice)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>raw idle load</TableCell>
          <TableCell>{format(cpu?.rawLoadIdle)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>raw irq load</TableCell>
          <TableCell>{format(cpu?.rawLoadIrq)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>raw steal load</TableCell>
          <TableCell>{format(cpu?.rawLoadSteal)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>raw guest load</TableCell>
          <TableCell>{format(cpu?.rawLoadGuest)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
  {info.processes?.list?.map(process => <div
    key={process?.pid}>
    <h4 className="font-bold mt-6">PID - {process?.pid}</h4>
    <Table>
      <Header />
      <TableBody>
        <TableRow>
          <TableCell>parent pid</TableCell>
          <TableCell>{format(process?.parentPid)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>name</TableCell>
          <TableCell>{format(process?.name)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu</TableCell>
          <TableCell>{format(process?.cpu)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu-u</TableCell>
          <TableCell>{format(process?.cpuu)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu-s</TableCell>
          <TableCell>{format(process?.cpus)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>memory</TableCell>
          <TableCell>{format(process?.mem)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>priority</TableCell>
          <TableCell>{format(process?.priority)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>vsz memory</TableCell>
          <TableCell>{format(process?.memVsz)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>rss memory</TableCell>
          <TableCell>{format(process?.memRss)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>nice</TableCell>
          <TableCell>{format(process?.nice)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>started</TableCell>
          <TableCell>{format(process?.started)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>state</TableCell>
          <TableCell>{format(process?.state)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>tty</TableCell>
          <TableCell>{format(process?.tty)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>user</TableCell>
          <TableCell>{format(process?.user)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>command</TableCell>
          <TableCell>{format(process?.command)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>path</TableCell>
          <TableCell>{format(process?.path)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>parameters</TableCell>
          <TableCell>{format(process?.params)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
  {info.services?.map((service, i) => <div key={i}>
    <h4 className="font-bold mt-6">Service - {i}</h4>
    <Table>
      <Header />
      <TableBody>
        <TableRow>
          <TableCell>name</TableCell>
          <TableCell>{format(service?.name)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>running</TableCell>
          <TableCell>{format(service?.running)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>start mode</TableCell>
          <TableCell>{format(service?.startmode)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>pids</TableCell>
          <TableCell>{format(service?.pids)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>cpu</TableCell>
          <TableCell>{format(service?.cpu)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>memory</TableCell>
          <TableCell>{format(service?.mem)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>) ?? null}
</div>;

export default ProcessInfo;
