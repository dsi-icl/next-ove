const net = require('net');
const z = require('zod').z;
const prompt = require('prompt');

const TIMEOUT = 5_000;

const DeviceSchema = z.strictObject({
  host: z.string(),
  port: z.number(),
  id: z.number()
});

const DetailsSchema = z.discriminatedUnion('type', [
  DeviceSchema.extend({ type: z.literal('info'), args: z.undefined() }),
  DeviceSchema.extend({ type: z.literal('power_on'), args: z.undefined() }),
  DeviceSchema.extend({ type: z.literal('power_off'), args: z.undefined() }),
  DeviceSchema.extend({ type: z.literal('reboot'), args: z.undefined() }),
  DeviceSchema.extend({ type: z.literal('set_source'), args: z.number() }),
  DeviceSchema.extend({ type: z.literal('get_source'), args: z.undefined() }),
  DeviceSchema.extend({ type: z.literal('get_mute'), args: z.undefined() }),
  DeviceSchema.extend({ type: z.literal('set_mute'), args: z.number() }),
  DeviceSchema.extend({ type: z.literal('get_volume'), args: z.undefined() }),
  DeviceSchema.extend({ type: z.literal('set_volume'), args: z.number() }),
]);

const formatCommand = command => {
  const checksum = command.slice(1).reduce((acc, x) => acc + x, 0) % 256;
  command.push(checksum);
  return new Uint8Array(command);
};

const formatInfo = id => formatCommand([0xAA, 0x00, id, 0x00]);
const formatPowerOff = id => formatCommand([0xAA, 0x11, id, 0x01, 0x00]);
const formatPowerOn = id => formatCommand([0xAA, 0x11, id, 0x01, 0x01]);
const formatReboot = id => formatCommand([0xAA, 0x11, id, 0x01, 0x02]);
const formatGetSource = id => formatCommand([0xAA, 0x14, id, 0x00]);
const formatSetSource = (id, source) => formatCommand([0xAA, 0x14, id, 0x01, source]);
const formatGetVolume = id => formatCommand([0xAA, 0x12, id, 0x00]);
const formatSetVolume = (id, volume) => formatCommand([0xAA, 0x12, id, 0x01, volume]);
const formatGetMute = id => formatCommand([0xAA, 0x13, id, 0x00]);
const formatSetMute = (id, isMute) => formatCommand([0xAA, 0x13, id, 0x01, isMute]);

/** @type {(result: Uint8Array) => void} */
const displayResult = result => console.log(`Result: ${(/** @type {number[]} */ result).map(x => x.toString(16)).join('|')}`);

/** @type {(data: Uint8Array) => void} */
const parseInfo = data => {
  displayResult(data);

  const power = data.at(6);
  const volume = data.at(7);
  const mute = data.at(8);
  const input = data.at(9);
  const aspect = data.at(10);
  const ntimenf = data.at(11);
  const ftimenf = data.at(12);

  console.log(`Power: ${power.toString(16)}`);
  console.log(`Volume: ${volume.toString(16)}`);
  console.log(`Is muted: ${mute.toString(16)}`);
  console.log(`Input: ${input.toString(16)}`);
  console.log(`Aspect: ${aspect.toString(16)}`);
  console.log(`N Time NF: ${ntimenf.toString(16)}`);
  console.log(`F Time NF: ${ftimenf.toString(16)}`);
};

/** @type {(data: Uint8Array) => void} */
const parsePower = data => {
  displayResult(data);
  const power = data.at(6);
  console.log(`Power: ${power.toString(16)}`);
};

/** @type {(data: Uint8Array) => void} */
const parseSource = data => {
  displayResult(data);
  const source = data.at(6);
  console.log(`Source: ${source.toString(16)}`);
};

/** @type {(data: Uint8Array) => void} */
const parseVolume = data => {
  displayResult(data);
  const volume = data.at(6);
  console.log(`Volume: ${volume.toString(16)}`);
};

/** @type {(data: Uint8Array) => void} */
const parseMute = data => {
  displayResult(data);
  const mute = data.at(6);
  console.log(`Is muted: ${mute.toString(16)}`);
};

const runCommand = async config => {
  const res = await new Promise(resolve => {
    const socket = new net.Socket();

    socket.setTimeout(TIMEOUT);
    setTimeout(() => {
      socket.end(() => resolve(new Error('Timeout')));
    }, TIMEOUT);

    socket.connect(config.port, config.host, () => {
      console.log('Connected');
    });

    socket.on('timeout', () => {
      console.log('Timed out');
      socket.end(() => resolve(new Error('Timeout')));
    });

    socket.on('data', data => {
      data = new Uint8Array(data);

      const status = data.at(4);
      if (status !== 0x41) {
        socket.end(() => resolve(new Error(data.at(6) ?? 'Command failure')));
        return;
      }

      switch (config.type) {
        case 'info':
          parseInfo(data);
          break;
        case 'power_on':
        case 'power_off':
        case 'reboot':
          parsePower(data);
          break;
        case 'get_source':
        case 'set_source':
          parseSource(data);
          break;
        case 'get_volume':
        case 'set_volume':
          parseVolume(data);
          break;
        case 'get_mute':
        case 'set_mute':
          parseMute(data);
          break;
        default:
          socket.end(() => resolve(new Error(`Unknown command type ${config.type}`)));
          return;
      }

      socket.end(() => resolve((/** @type {number[]} */new Uint8Array(data)).map(x => x.toString(16)).join('|')));
    });

    socket.on('error', err => {
      console.error('Error received:', err);
      socket.end(() => resolve(err));
    });

    let command;

    switch (config.type) {
      case 'info':
        command = formatInfo(config.id);
        break;
      case 'power_off':
        command = formatPowerOff(config.id);
        break;
      case 'power_on':
        command = formatPowerOn(config.id);
        break;
      case 'reboot':
        command = formatReboot(config.id);
        break;
      case 'get_source':
        command = formatGetSource(config.id);
        break;
      case 'set_source':
        command = formatSetSource(config.id, config.args);
        break;
      case 'get_volume':
        command = formatGetVolume(config.id);
        break;
      case 'set_volume':
        command = formatSetVolume(config.id, config.args);
        break;
      case 'get_mute':
        command = formatGetMute(config.id);
        break;
      case 'set_mute':
        command = formatSetMute(config.id, config.args);
        break;
      default:
        socket.end(() => resolve(new Error(`Unknown command type ${config.type}`)));
        return;
    }

    socket.write(new Uint8Array(command), err => {
      if (err) {
        console.error('Write error:', err);
        socket.end(() => resolve(err));
      } else {
        console.log('Data sent');
      }
    });
  });

  console.log(`Finished with status: ${res}`);
};

const getDetails = async () => {
  prompt.start();
  prompt.message = 'Enter screen IP, port number, ID, the desired command and any additional arguments:\n';
  prompt.delimiter = '';
  const details = await prompt.get({
    properties: {
      host: {
        message: 'screen IP:',
        required: true
      },
      port: {
        message: 'port:',
        required: true
      },
      id: {
        message: 'id:',
        required: true
      },
      type: {
        message: 'command:',
        required: true
      },
      args: {
        message: 'arguments:',
        required: false
      }
    }
  });

  return DetailsSchema.parse({
    host: details.host,
    port: parseInt(details.port.toString()),
    id: parseInt(details.id.toString()),
    type: details.type,
    args: details.args === '' ? undefined : parseInt(details.args.toString())
  });
};

getDetails().then(runCommand).catch(console.error);
