const express = require("express");
const cors = require("cors");
const { app, server } = require("./src/app.js");
const dotenv = require("dotenv");
const v1 = require("./src/v1/router");
const { rateLimit } = require("express-rate-limit");

dotenv.config({ path: process.env.ENV_FILE ?? ".env" });

app.use(express.static("public"));
app.use(cors());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false
}));

app.use("/api/v1", v1);

app.get("/status", (_req, res) => res.send({ status: "running" }));

server.listen(process.env.PORT, () =>
  console.log(`Logging server running on ${process.env.PORT}`));
