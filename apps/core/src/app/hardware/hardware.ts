import * as express from "express";

const router = express.Router();
let io = null;
let clients = {};
let logger = null;

const init = (io_, logger_) => {
  logger = logger_;
  logger.info('Initialising Hardware');
  io = io_.of("/hardware");

  io.on("connection", socket => {
    logger.info(`${socket.id} connected via /hardware`);
    logger.debug(`Socket ID: ${socket.handshake.auth.name}`);
    clients = {...clients, [socket.handshake.auth.name]: socket.id};
    logger.debug(JSON.stringify(clients));

    socket.on("disconnect", reason => {
      delete clients[socket.handshake.auth.name];
      logger.debug(JSON.stringify(clients));
      logger.info(`${socket.id} disconnected with reason: ${reason}`);
    });
  });
};

router.get("/", (req, res) => res.send("Home page"));

router.get("/spaces", (req, res) => {
  req["io"].of("/hardware").timeout(5000).emit("spaces", (err, response) => {
    if (err) {
      res.sendStatus(400);
      return;
    }
    res.send(response);
  });
});

router.get("/devices", (req, res) => {
  req["io"].of("/hardware").timeout(5000).emit("message", "/devices", "GET", (err, response) => {
    if (err) {
      res.sendStatus(400);
      return;
    }
    res.send(response);
  });
});

router.get("/devices/:bridge", (req, res) => {
  console.log(req.params.bridge);
  req["io"].of("/hardware").to(clients[req.params.bridge]).timeout(5000).emit("message", "/devices", "GET", (err, response) => {
    if (err) {
      res.sendStatus(400);
    }
    res.send(response);
  });
});

router.get("/device/:bridge/:id", (req, res) => {
  req["io"].of("/hardware").to(clients[req.params.bridge]).timeout(5000).emit("message", `/device/${req.params.id}`, "GET", (err, response) => {
    if (err) {
      res.sendStatus(400);
    }
    res.send(response);
  });
});

// router.get("/device/:bridge/:id/shutdown", (req, res) => {
//
// });

router.get("/general", (req, res) => {
  req["io"].of("/hardware").timeout(5000).emit("message", "/hardware/general", "GET", (err, response) => {
    if (err) {
      res.sendStatus(400);
      return;
    }

    res.send(response);
  });
});

export {router, init};
