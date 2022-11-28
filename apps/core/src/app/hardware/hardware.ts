import * as express from "express";

const router = express.Router();

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

router.get("/hardware", (req, res) => {
  req["io"].of("/hardware").timeout(5000).emit("hardware", (err, response) => {
    if (err) {
      res.sendStatus(400);
      return;
    }
    res.send(response);
  });
});

router.get("/general", (req, res) => {
  req["io"].of("/hardware").timeout(5000).emit("hardware/general", (err, response) => {
    if (err) {
      res.sendStatus(400);
      return;
    }

    res.send(response);
  })
})

export default router;
