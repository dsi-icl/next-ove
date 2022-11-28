import * as express from "express";

const router = express.Router();
let io = null;

const init = io_ => {
  console.log('Initialising Hardware');
  io = io_.of("/hardware");

  io.on("connection", socket => {
    console.log(`${socket.id} connected via /hardware`);
    console.log(`Socket ID: ${socket.handshake.auth.name}`);

    socket.on("disconnect", reason => console.log(`${socket.id} disconnected with reason: ${reason}`));
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

// router.get("/devices/:bridge", (req, res) => {
//
// });

router.get("/device/:id", (req, res) => {
  req["io"].of("/hardware").timeout(5000).emit("message", req.url, "GET", (err, response) => {
    if (err) {
      res.sendStatus(400);
    }
    res.send(response);
  });
});

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
