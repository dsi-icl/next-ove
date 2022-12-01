/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as path from 'path';
import * as controller from "./app/controller";

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to control-client!' });
});

app.get("/status", controller.getStatus);

app.get("/info/general", controller.getInfoGeneral);
app.get("/info/system", controller.getInfoSystem);
app.get("/info/cpu", controller.getInfoCPU);
app.get("/info/memory", controller.getInfoMemory);
app.get("/info/battery", controller.getInfoBattery);
app.get("/info/graphics", controller.getInfoGraphics);
app.get("/info/os", controller.getInfoOS);
app.get("/info/processes", controller.getInfoProcesses);
app.get("/info/fs", controller.getInfoFS);
app.get("/info/usb", controller.getInfoUSB);
app.get("/info/printer", controller.getInfoPrinter);
app.get("/info/audio", controller.getInfoAudio);
app.get("/info/network", controller.getInfoNetwork);
app.get("/info/wifi", controller.getInfoWifi);
app.get("/info/bluetooth", controller.getInfoBluetooth);
app.get("/info/docker", controller.getInfoDocker);

app.post("/shutdown", controller.shutdown);

app.post("/reboot", controller.reboot);

app.post("/browser", controller.openBrowser);

const port = process.env.port || 3335;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
